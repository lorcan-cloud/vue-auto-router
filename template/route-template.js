/**
 * 自定义路由模板函数
 * @param {string} dirName - 目录名
 * @param {string[]} files - 文件路径列表
 * @param {Object} context - 上下文信息
 * @param {string} context.dirName - 目录名
 * @param {string[]} context.files - 文件路径列表
 * @param {Object[]} context.imports - 导入声明列表
 * @param {Object[]} context.routes - 路由配置
 * @param {Object} context.options - 配置选项
 * @returns {string} 生成的路由文件内容
 */
module.exports = function(dirName, files, context) {
  /**
   * 转换为帕斯卡命名法（PascalCase）
   * @param {string} str 输入字符串
   * @returns {string} 转换后的字符串
   */
  function toPascalCase(str) {
    return str
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
  }

  /**
   * 转换为驼峰命名法（camelCase）
   * @param {string} str 输入字符串
   * @returns {string} 转换后的字符串
   */
  function toCamelCase(str) {
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  /**
   * 获取组件名称
   * @param {string} file 文件路径
   * @returns {string} 组件名称
   */
  function getComponentName(file) {
    const name = file.split('/').pop().replace('.vue', '');
    return toPascalCase(name);
  }

  /**
   * 获取路由路径
   * @param {string} file 文件路径
   * @returns {string} 路由路径
   */
  function getRoutePath(file) {
    const name = file.split('/').pop().replace('.vue', '');
    return name === 'index' ? '' : name;
  }

  /**
   * 获取路由名称
   * @param {string} dirName 目录名
   * @param {string} fileName 文件名
   * @returns {string} 路由名称
   */
  function getRouteName(dirName, fileName) {
    const baseName = toPascalCase(dirName);
    const name = fileName.replace('.vue', '');
    return name === 'index' ? baseName : `${baseName}${toPascalCase(name)}`;
  }

  /**
   * 获取路由标题
   * @param {string} name 文件名
   * @returns {string} 路由标题
   */
  function getRouteTitle(name) {
    return name === 'index' ? toPascalCase(dirName) : toPascalCase(name);
  }

  // 生成导入声明
  const imports = files.map(file => {
    const componentName = getComponentName(file);
    return `const ${componentName} = () => import('${file}')`;
  }).join('\n');

  // 生成路由配置
  return `
import type { RouteRecordRaw } from 'vue-router'
import Layout from '${context.options.layoutPath}'

${imports}

const Router: Array<RouteRecordRaw> = [
  {
    path: '/${dirName}',
    component: Layout,
    meta: {
      title: '${toPascalCase(dirName)}',
      icon: 'home',
      sort: 1
    },
    children: [
      ${files.map(file => {
        const name = file.split('/').pop().replace('.vue', '');
        const componentName = getComponentName(file);
        const path = getRoutePath(file);
        const routeName = getRouteName(dirName, name);
        const title = getRouteTitle(name);
        
        return `{
          path: '${path}',
          component: ${componentName},
          name: '${routeName}',
          meta: {
            title: '${title}',
            keepAlive: true,
            icon: '${path || 'home'}',
            sort: ${path ? 2 : 1}
          }
        }`;
      }).join(',\n      ')}
    ]
  }
]

export default Router
`;
}; 