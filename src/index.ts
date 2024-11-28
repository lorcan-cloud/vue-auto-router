import type { Plugin, ViteDevServer } from 'vite';
import { RouteGenerator } from './generator';
import type { PluginOptions } from './types';
import path from 'path';

/**
 * Vue 路由自动生成插件
 * @param options 插件配置选项
 * @returns Vite 插件
 */
function VueAutoRouter(options: PluginOptions = {}): Plugin {
  const generator = new RouteGenerator(options);
  let server: ViteDevServer | undefined;
  let isWatcherEnabled = false;

  // 消息模板
  const messages = {
    EN: {
      routesRegenerated: (dir: string) => `🔄 Routes regenerated due to changes in ${dir} directory`,
      regenerateError: (dir: string) => `Failed to regenerate routes for ${dir}:`,
      routesGenerated: '🚀 Routes generated successfully',
      configureError: 'Failed to configure server:',
      buildGenerated: '🚀 Routes generated for production build',
      buildError: 'Failed to generate routes during build:'
    },
    CN: {
      routesRegenerated: (dir: string) => `🔄 已重新生成 ${dir} 目录的路由`,
      regenerateError: (dir: string) => `重新生成 ${dir} 的路由失败：`,
      routesGenerated: '🚀 路由生成成功',
      configureError: '配置服务器失败：',
      buildGenerated: '🚀 已为生产构建生成路由',
      buildError: '构建时生成路由失败：'
    }
  };

  const msg = messages[options.language || 'EN'];

  /**
   * 获取目录名称
   * @param file 文件路径
   * @returns 目录名称或 null
   */
  function getDirectoryName(file: string): string | null {
    // 标准化路径
    const normalizedFile = file.replace(/\\/g, '/');
    
    // 检查是否是 .vue 文件
    if (!normalizedFile.endsWith('.vue')) {
      return null;
    }

    // 获取扫描目录的基础路径
    const scanDir = (options.scanDir || 'src/pages').replace(/\\/g, '/');
    const scanDirBase = scanDir.split('/').pop() || 'pages';

    // 匹配目录名
    const pattern = new RegExp(`${scanDirBase}/([^/]+)`);
    const match = normalizedFile.match(pattern);
    if (!match) return null;

    return match[1];
  }

  /**
   * 处理文件变化
   * @param file 变化的文件路径
   */
  async function handleFileChange(file: string): Promise<void> {
    const dirName = getDirectoryName(file);
    if (!dirName) return;
    
    // 检查是否在排除列表中
    if (options.exclude?.includes(dirName)) {
      return;
    }

    try {
      await generator.generate();
      console.log(msg.routesRegenerated(dirName));
      
      server?.ws.send({
        type: 'custom',
        event: 'vue-auto-router:update',
        data: { 
          file: file.replace(/\\/g, '/'),
          directory: dirName,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error(msg.regenerateError(dirName), error);
    }
  }

  /**
   * 启用文件监听
   */
  function enableWatcher(): void {
    if (!server || isWatcherEnabled) return;
    
    server.watcher.on('add', handleFileChange);
    server.watcher.on('unlink', handleFileChange);
    server.watcher.on('change', handleFileChange);
    isWatcherEnabled = true;
  }

  /**
   * 禁用文件监听
   */
  function disableWatcher(): void {
    if (!server || !isWatcherEnabled) return;

    server.watcher.off('add', handleFileChange);
    server.watcher.off('unlink', handleFileChange);
    server.watcher.off('change', handleFileChange);
    isWatcherEnabled = false;
  }
  
  return {
    name: 'vue-auto-router',
    
    /**
     * 配置开发服务器
     */
    async configureServer(_server: ViteDevServer) {
      server = _server;
      
      try {
        await generator.generate();
        console.log(msg.routesGenerated);
        enableWatcher();
      } catch (error) {
        console.error(msg.configureError, error);
        throw error;
      }
    },
    
    /**
     * 构建开始时生成路由
     */
    async buildStart() {
      try {
        await generator.generate();
        console.log(msg.buildGenerated);
      } catch (error) {
        console.error(msg.buildError, error);
        throw error;
      }
    },

    /**
     * 构建结束时清理
     */
    buildEnd() {
      disableWatcher();
      server = undefined;
    },

    /**
     * 关闭时清理
     */
    closeBundle() {
      disableWatcher();
      server = undefined;
    }
  };
}

// 修改导出方式
module.exports = VueAutoRouter;
module.exports.default = VueAutoRouter;
export default VueAutoRouter;
export type { PluginOptions }; 