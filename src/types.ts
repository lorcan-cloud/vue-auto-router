/**
 * 路由模板上下文接口
 */
export interface RouteTemplateContext {
  /** 目录名称 */
  dirName: string;
  /** 文件路径列表 */
  files: string[];
  /** 导入声明列表 */
  imports: ImportDeclaration[];
  /** 路由配置 */
  routes: RouteNode[];
  /** 配置选项 */
  options: {
    /** 布局组件路径 */
    layoutPath: string;
  };
}

/**
 * 路由模板函数类型
 */
export type RouteTemplateFunction = (
  dirName: string,
  files: string[],
  context: RouteTemplateContext
) => string;

/**
 * 插件配置选项接口
 */
export interface PluginOptions {
  /**
   * 扫描的目录路径
   * @default 'src/pages'
   * @example 'src/pages' 或 'src/views'
   */
  scanDir?: string;

  /**
   * 输出目录路径
   * @default 'src/router/'
   * @example 'src/router/' 或 'src/routes/'
   */
  outputDir?: string;

  /**
   * 要排除的目录名称
   * @default []
   * @example ['layout', 'components']
   */
  exclude?: string[];

  /**
   * 布局组件路径
   * @default '@/pages/layout/index.vue'
   * @example '@/layout/index.vue'
   */
  layoutPath?: string;

  /**
   * 强制覆盖的目录名称列表
   * @default []
   * @example ['home', 'user']
   * @description 这些目录下的路由文件将始终被覆盖，不会提示手动删除
   */
  forceOverwrite?: string[];

  /**
   * 自定义路由模板文件路径
   * @default undefined
   * @example 'src/route-template.js'
   * @description 文件需要导出一个函数，接收目录名和文件列表，返回路由文件内容
   */
  routeTemplate?: string;

  /**
   * 控制台输出语言
   * @default 'EN'
   * @example 'CN' 或 'EN'
   * @description 控制台提示信息的语言，CN 为中文，EN 为英文
   */
  language?: 'CN' | 'EN';
}

/**
 * 必需的配置选项接口
 */
export interface RequiredOptions {
  /** 扫描的目录路径 */
  scanDir: string;
  /** 输出目录路径 */
  outputDir: string;
  /** 要排除的目录名称 */
  exclude: string[];
  /** 布局组件路径 */
  layoutPath: string;
  /** 强制覆盖的目录名称列表 */
  forceOverwrite: string[];
  /** 自定义路由模板文件路径 */
  routeTemplate: string | undefined;
  /** 控制台输出语言 */
  language: 'CN' | 'EN';
}

/**
 * 路由节点接口
 */
export interface RouteNode {
  /** 路由路径 */
  path: string;

  /** 路由组件 */
  component: string;

  /** 路由名称 */
  name: string;

  /** 子路由 */
  children?: RouteNode[];

  /** 路由元信息 */
  meta?: Record<string, any>;
}

/**
 * 导入声明接口
 */
export interface ImportDeclaration {
  /** 组件名称 */
  name: string;

  /** 导入路径 */
  path: string;
} 