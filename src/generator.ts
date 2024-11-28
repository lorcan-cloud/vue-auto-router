import { glob } from 'glob';
import path from 'path';
import { promises as fs } from 'fs';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import type { ImportDeclaration, RouteNode, PluginOptions, RequiredOptions, RouteTemplateFunction } from './types';

/**
 * 路由生成器类
 */
export class RouteGenerator {
  private options: RequiredOptions;
  private routeTemplateFunction: RouteTemplateFunction | null = null;
  
  constructor(options: PluginOptions) {
    // 标准化路径，移除末尾斜杠
    const normalizedOptions = {
      scanDir: this.normalizePath(options.scanDir || 'src/pages'),
      outputDir: this.normalizePath(options.outputDir || 'src/router/'),
      exclude: options.exclude || [],
      layoutPath: options.layoutPath || '@/pages/layout/index.vue',
      forceOverwrite: options.forceOverwrite || [],
      routeTemplate: options.routeTemplate
    };

    this.options = normalizedOptions;
    this.ensureDirectoriesExist();
    this.loadRouteTemplate();
  }

  /**
   * 标准化路径
   * @param path 路径
   * @returns 标准化后的路径
   */
  private normalizePath(path: string): string {
    if (!path) return '';
    // 将反斜杠转换为正斜杠
    const normalizedPath = path.replace(/\\/g, '/');
    // 移除末尾斜杠（除了 outputDir）
    if (normalizedPath === this.options?.outputDir) {
      return normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`;
    }
    return normalizedPath.endsWith('/') ? normalizedPath.slice(0, -1) : normalizedPath;
  }

  /**
   * 确保必要的目录存在
   */
  private async ensureDirectoriesExist(): Promise<void> {
    try {
      // 创建扫描目录
      const scanDirPath = this.options.scanDir.startsWith('@') 
        ? path.join(process.cwd(), 'src', this.options.scanDir.slice(2))
        : path.join(process.cwd(), this.options.scanDir);
      
      // 创建输出目录
      const outputDirPath = this.options.outputDir.startsWith('@')
        ? path.join(process.cwd(), 'src', this.options.outputDir.slice(2))
        : path.join(process.cwd(), this.options.outputDir);

      await mkdir(scanDirPath, { recursive: true });
      await mkdir(outputDirPath, { recursive: true });
      
      console.log('✨ Directories created/verified successfully');
    } catch (error) {
      console.error('Failed to create directories:', error);
    }
  }

  /**
   * 生成路由配置
   */
  async generate(): Promise<void> {
    try {
      const files = await this.scanFiles();
      if (!files.length) {
        console.warn('⚠️ No .vue files found in the specified directory');
        return;
      }

      // 按目录分组处理文件
      const fileGroups = this.groupFilesByDirectory(files);
      
      // 为每个目录生成单独的路由文件
      for (const [dir, groupFiles] of Object.entries(fileGroups)) {
        // 检查目录是否有文件
        if (!groupFiles.length) {
          console.warn(`⚠️ No .vue files found in directory: ${dir}`);
          continue;
        }

        // 检查是否有 index.vue 文件
        const hasIndex = groupFiles.some(file => 
          path.basename(file, '.vue') === 'index'
        );

        if (!hasIndex) {
          console.warn(
            `⚠️ No index.vue found in directory: ${dir}\n` +
            `A default route with empty path will not be generated.`
          );
        }

        const routes = [{
          path: this.getRoutePath(dir),
          component: 'Layout',
          name: this.getRouteBaseName(dir),
          children: groupFiles.map(file => ({
            path: this.getSubRoutePath(file),
            component: this.getComponentName(file),
            name: this.getRouteName(dir, file)
          }))
        }];
        
        const imports = this.generateImports(groupFiles);

        // 检查是否在强制覆盖列表中
        const isForceOverwrite = this.options.forceOverwrite.includes(dir);
        await this.writeRouteFile(routes, imports, dir, isForceOverwrite);
      }
    } catch (error) {
      console.error('❌ Failed to generate routes:', error);
      throw error;
    }
  }

  /**
   * 扫描文件
   * @returns 匹配的文件路径数组
   */
  private async scanFiles(): Promise<string[]> {
    try {
      // 构建排除模式
      const excludePatterns = [
        '**/node_modules/**',
        ...this.options.exclude.map(pattern => 
          pattern.includes('/') ? pattern : `${this.options.scanDir}${pattern}/**`
        )
      ];

      // 首先获取所有一级目录
      const scanDirPath = this.options.scanDir.startsWith('@')
        ? path.join(process.cwd(), 'src', this.options.scanDir.slice(2))
        : path.join(process.cwd(), this.options.scanDir);

      const dirents = await fs.readdir(scanDirPath, { withFileTypes: true });
      const directories = dirents
        .filter(dirent => dirent.isDirectory())
        .map(dirent => path.join(scanDirPath, dirent.name));

      // 然后获取每个目录下的 .vue 文件
      const allFiles: string[] = [];
      for (const dir of directories) {
        const dirName = path.basename(dir);
        
        // 跳过被排除的目录
        if (this.options.exclude.includes(dirName)) {
          continue;
        }

        // 只扫描一级 .vue 文件
        const files = await glob(`${dir}/*.vue`, {
          absolute: true,
          nodir: true,
          ignore: excludePatterns
        });

        allFiles.push(...files);
      }

      return allFiles;
    } catch (error) {
      console.error('Failed to scan files:', error);
      return [];
    }
  }

  /**
   * 生成导入声明
   * @param files 文件路径数组
   * @returns 导入声明数组
   */
  private generateImports(files: string[]): ImportDeclaration[] {
    return files.map(file => ({
      name: this.getComponentName(file),
      path: this.getImportPath(file)
    }));
  }

  /**
   * 生成路由配置
   * @param files 文件路径数组
   * @returns 路由节点数组
   */
  private generateRoutes(files: string[]): RouteNode[] {
    const fileGroups = this.groupFilesByDirectory(files);
    
    return Object.entries(fileGroups).map(([dir, files]) => ({
      path: this.getRoutePath(dir),
      component: 'Layout',
      name: this.getRouteBaseName(dir),
      children: files.map(file => ({
        path: this.getSubRoutePath(file),
        component: this.getComponentName(file),
        name: this.getRouteName(dir, file)
      }))
    }));
  }

  /**
   * 写入路由文件
   * @param routes 路由配置
   * @param imports 导入声明
   * @param dirName 目录名
   * @param forceOverwrite 是否强制覆盖
   */
  private async writeRouteFile(
    routes: RouteNode[], 
    imports: ImportDeclaration[],
    dirName: string,
    forceOverwrite: boolean = false
  ): Promise<void> {
    const content = this.generateRouteFileContent(routes, imports);
    
    try {
      await mkdir(this.options.outputDir, { recursive: true });
      const fileName = `${dirName}.ts`;
      const outputPath = path.join(this.options.outputDir, fileName);

      // 检查文件是否已存在
      if (await this.fileExists(outputPath)) {
        if (!forceOverwrite) {
          console.warn(
            `⚠️ Route file already exists: ${fileName}\n` +
            `To update the route configuration:\n` +
            `1. Add "${dirName}" to forceOverwrite option, or\n` +
            `2. Manually delete the file and restart the server.`
          );
          return;
        }
        console.log(`🔄 Overwriting route file: ${fileName} (forceOverwrite enabled)`);
      }

      await fs.writeFile(outputPath, content, 'utf-8');
      console.log(`✨ Generated route file: ${outputPath}`);
    } catch (error) {
      console.error('❌ Failed to write route file:', error);
      throw error;
    }
  }

  /**
   * 检查文件否存在
   * @param filePath 文件路径
   * @returns 是否存在
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取组件名称
   * @param file 文件路径
   * @returns 组件名称
   */
  private getComponentName(file: string): string {
    const basename = path.basename(file, '.vue');
    // 处理文件名中的特殊字符（横杠、下划线等）
    return this.toPascalCase(basename);
  }

  /**
   * 获取导入路径
   * @param file 文件路径
   * @returns 导入路径
   */
  private getImportPath(file: string): string {
    const normalizedPath = file.replace(/\\/g, '/');
    const match = normalizedPath.match(/src\/(.*)/);
    if (!match) return file;
    return `@/${match[1]}`;
  }

  /**
   * 获取路由路径
   * @param dir 目录名
   * @returns 路由路径
   */
  private getRoutePath(dir: string): string {
    if (!dir) return '/';
    const dirName = dir.split('/').pop();
    if (!dirName) return '/';
    // 保持原有的分隔符（横杠或下划线）
    return '/' + dirName;
  }

  /**
   * 获取子路由路径
   * @param file 文件路径
   * @returns 子路由路径
   */
  private getSubRoutePath(file: string): string {
    const basename = path.basename(file, '.vue');
    // 保持原有的分隔符（横杠或下划线）
    return basename === 'index' ? '' : basename;
  }

  /**
   * 获取路由基础名称
   * @param dir 目录名
   * @returns 路由基础名称
   */
  private getRouteBaseName(dir: string): string {
    // 处理目录名中的特殊字符
    return this.toPascalCase(dir);
  }

  /**
   * 获取路由名称
   * @param dir 目录名
   * @param file 文件路径
   * @returns 路由名称
   */
  private getRouteName(dir: string, file: string): string {
    const dirName = dir.split('/').pop() || '';
    const fileName = path.basename(file, '.vue');
    const baseName = this.getRouteBaseName(dirName);
    
    if (fileName === 'index') {
      return baseName;
    }

    // 处理文件名中的特殊字符
    const componentName = this.toPascalCase(fileName);
    return baseName + componentName;
  }

  /**
   * 按目录分组文件
   * @param files 文件路径数组
   * @returns 分组后的文件映射
   */
  private groupFilesByDirectory(files: string[]): Record<string, string[]> {
    return files.reduce((acc, file) => {
      const normalizedPath = file.replace(/\\/g, '/');
      const dir = path.basename(path.dirname(normalizedPath));
      
      if (!acc[dir]) acc[dir] = [];
      acc[dir].push(file);
      return acc;
    }, {} as Record<string, string[]>);
  }

  /**
   * 加载路由模板函数
   */
  private async loadRouteTemplate(): Promise<void> {
    if (!this.options.routeTemplate) return;

    try {
      const templatePath = path.resolve(process.cwd(), this.options.routeTemplate);
      if (!existsSync(templatePath)) {
        console.warn(`⚠️ Route template file not found: ${templatePath}`);
        return;
      }

      const template = require(templatePath);
      if (typeof template !== 'function') {
        console.warn('⚠️ Route template must export a function');
        return;
      }

      this.routeTemplateFunction = template;
      console.log('✨ Route template loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load route template:', error);
    }
  }

  /**
   * 生成路由文件内容
   */
  private generateRouteFileContent(routes: RouteNode[], imports: ImportDeclaration[]): string {
    // 如果有自定义模板函数，使用它
    if (this.routeTemplateFunction) {
      try {
        // 获取目录名和处理后的文件路径
        const files = imports.map(imp => imp.path);
        const dirName = path.basename(path.dirname(files[0]));

        // 为模板函数提供更多上下文信息
        const context = {
          dirName,
          files,
          imports,
          routes,
          options: {
            layoutPath: this.options.layoutPath
          }
        };

        // 调用模板函数
        const content = this.routeTemplateFunction(dirName, files, context);
        if (typeof content !== 'string') {
          throw new Error('Template function must return a string');
        }

        return content;
      } catch (error) {
        console.error('❌ Failed to generate content using template:', error);
        console.log('��️ Falling back to default template');
      }
    }

    // 使用默认模板
    const routeStr = JSON.stringify(routes, null, 2)
      .replace(/"component": "([^"]+)"/g, 'component: $1')
      .replace(/"children": /g, 'children: ')
      .replace(/"path": /g, 'path: ')
      .replace(/"name": /g, 'name: ');

    return `
import type { RouteRecordRaw } from 'vue-router'
import Layout from '${this.options.layoutPath}'

${imports.map(imp => 
  `const ${imp.name} = () => import('${imp.path}')`
).join('\n')}

const Router: Array<RouteRecordRaw> = ${routeStr}

export default Router
`;
  }

  /**
   * 转换为帕斯卡命名法（PascalCase）
   * @param str 输入字符串
   * @returns 转换后的字符串
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
  }
} 