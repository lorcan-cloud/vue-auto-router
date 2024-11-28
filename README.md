# @lorcan-store/vue-auto-router

一个基于 Vite 的 Vue 路由自动生成插件。该插件会自动扫描指定目录下的 Vue 文件，并根据文件结构生成对应的路由配置。

## 功能特点

- 🚀 自动扫描指定目录下的 Vue 文件
- 📁 根据文件结构自动生成路由配置
- ⚙️ 支持自定义扫描目录和输出目录
- 🔍 支持文件排除配置
- 🔄 支持开发环境热更新
- 📦 支持最新版本的 Vite 和 Vue Router
- 🎯 自动生成以目录名命名的路由文件

## 安装

```bash
npm install @lorcan-store/vue-auto-router -D
# 或
yarn add @lorcan-store/vue-auto-router -D
# 或
pnpm add @lorcan-store/vue-auto-router -D
```

## 使用方法

在 `vite.config.ts` 中配置：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueAutoRouter from '@lorcan-store/vue-auto-router'

export default defineConfig({
  plugins: [
    vue(),
    VueAutoRouter({
      // 配置选项
      scanDir: 'src/pages',           // 扫描目录
      outputDir: 'src/router/',       // 输出目录
      exclude: ['layout'],            // 排除的目录
      layoutPath: '@/pages/layout/index.vue',  // 布局组件路径
      forceOverwrite: ['home']        // 强制覆盖的目录列表
    })
  ]
})
```

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| scanDir | string | 'src/pages' | 要扫描的根目录路径 |
| outputDir | string | 'src/router/' | 路由配置文件的输出目录 |
| exclude | string[] | [] | 要排除的目录名称 |
| layoutPath | string | '@/pages/layout/index.vue' | 布局组件的路径 |
| forceOverwrite | string[] | [] | 强制覆盖的目录名称列表，这些目录的路由文件将始终被覆盖 |
| routeTemplate | string | undefined | 自定义路由模板文件路径 |

## 目录结构示例

```
src/
  pages/              # scanDir 指向此目录
    layout/           # 布局组件目录（通常被排除）
      index.vue      # 布局组件
    home/            # 首页模块（将生成 home.ts）
      index.vue     # 首页
      about.vue     # 关于页面
    user_manager/    # 用户管理模块（将生成 user_manager.ts）
      index.vue     # 列表页面
      form.vue      # 表单页面
```

## 扫描规则

1. **目录扫描**
   - 只扫描 scanDir 下的一级目录
   - 每个目录生成独立的路由文件
   - 可以通过 exclude 排除不需要的目录

2. **文件扫描**
   - 只扫描每个目录下的一级 .vue 文件
   - 不会扫描子目录中的文件
   - 支持 index.vue 和其他命名的 .vue 文件

生成路由文件结构：

```
src/
  router/
    home.ts           # 首页路由配置
    user_manager.ts   # 用户管理路由配置
```

生成的路由配置示例 (user_manager.ts)：

```typescript
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/pages/layout/index.vue'

const Index = () => import('@/pages/user_manager/index.vue')
const Form = () => import('@/pages/user_manager/form.vue')

const Router: Array<RouteRecordRaw> = [
  {
    path: '/user_manager',
    component: Layout,
    name: 'UserManager',
    children: [
      { path: '', component: Index, name: 'UserManager' },
      { path: 'form', component: Form, name: 'UserManagerForm' }
    ]
  }
]

export default Router
```

## 路由生成规则

1. **文件导入规则**
   - 匹配到的 Vue 文件会被转换为动态导入
   - 常量名使用文件名首字母大写，特殊字符会被处理为驼峰式命名
   - 导入路径会自动转换为 @ 别名形式
   - 示例：
     * house-build.vue -> const HouseBuild
     * user_profile.vue -> const UserProfile
     * data_analysis-chart.vue -> const DataAnalysisChart

2. **路由路径规则**
   - 路径使用目录名全小写，保持原有的分隔符（横杠或下划线）
   - index.vue 文件对应空路径
   - 其他文件名直接作为子路径，保持原有的分隔符
   - 示例：
     * /pages/user-center/index.vue -> path: ''
     * /pages/user-center/user-info.vue -> path: 'user-info'
     * /pages/data_analysis/data_chart.vue -> path: 'data_chart'

3. **路由名称规则**
   - 使用目录名转换为驼峰式命名，移除所有分隔符
   - 子路由会附加文件名（首字母大写，转换为驼峰式）
   - 示例：
     * user-center/index.vue -> name: 'UserCenter'
     * user-center/user-info.vue -> name: 'UserCenterUserInfo'
     * data_analysis/data_chart.vue -> name: 'DataAnalysisDataChart'

4. **文件生成规则**
   - 每个目录生成独立的路由文件
   - 文件名使用目录名命名
   - 如果路由文件已存在，不会覆盖而是提示手动删除
   - 删除已存在的路由文件后，需要重启服务器以重新生成

## 注意事项

1. 确保项目中已安装最新版本的 `vue-router`
2. scanDir 应指向包含所有模块目录的根目录（通常是 src/pages）
3. 布局组件默认位于 `src/pages/layout/index.vue`，建议将 layout 目录添加到 exclude 中
4. 只会扫描一级目录下的 .vue 文件，不会处理子目录
5. 每个目录会生成独立的路由文件，文件名与目录名相同
6. 如果路由文件已存在，插件不会自动覆盖，而是提示手动删除
7. 删除已存在的路由文件后，需要重启开发服务器以重新生成
8. 如果指定的目录不存在，插件会自动创建
9. 可以通过 forceOverwrite 配置指定某些目录的路由文件始终覆盖，不需要手动删除
10. forceOverwrite 中的目录在文件变化时会自动更新路由配置

## 开发环境

插件会在以下情况检查并生成路由配置：
1. 开发服务器启动时
2. 添加新的 .vue 文件时（如果对应的路由文件不存在，或目录在 forceOverwrite 列表中）
3. 删除 .vue 文件时（如果对应的路由文件不存在，或目录在 forceOverwrite 列表中）
4. 修改 .vue 文件时（如果对应的路由文件不存在，或目录在 forceOverwrite 列表中）
5. 项目构建开始时

如果需要更新已存在的路由文件：
1. 将目录添加到 forceOverwrite 列表中，或
2. 手动删除需要更新的路由文件并重启开发服务器

## 版本要求

- Vite: 最新版本
- Vue Router: 最新版本
- Node.js: >= 16.0.0

## License

MIT

## 自定义路由模板

你可以通过 routeTemplate 配置项指定一个自定义的路由模板文件：

```typescript
VueAutoRouter({
  scanDir: 'src/pages',
  routeTemplate: 'src/route-template.js'
})
```

> 💡 提示：你可以在 [GitHub 仓库](https://github.com/lorcan-cloud/vue-auto-router/blob/main/examples/route-template.js) 中找到完整的模板示例文件，或者直接从 node_modules/@lorcan-store/vue-auto-router/examples/route-template.js 复制。

### 模板文件位置

你可以通过以下方式获取模板文件：

1. 从 node_modules 复制：
```bash
cp node_modules/@lorcan-store/vue-auto-router/examples/route-template.js src/route-template.js
```

2. 从 GitHub 仓库下载：
   - [route-template.js](https://github.com/lorcan-cloud/vue-auto-router/blob/main/examples/route-template.js)

3. 或者直接使用以下内容创建模板文件：

```javascript
/**
 * 自定义路由模板函数
 * @param {string} dirName - 目录名
 * @param {string[]} files - 文件路径列表
 * @param {Object} context - 上下文信息
 * @returns {string} 生成的路由文件内容
 */
module.exports = function(dirName, files, context) {
  // ... 模板实现
};
```

## 贡献

欢迎提交 Issue 和 Pull Request！

- Issue: [创建 Issue](https://github.com/lorcan-cloud/vue-auto-router/issues)
- Pull Request: [创建 PR](https://github.com/lorcan-cloud/vue-auto-router/pulls)

## 示例

完整的示例代码和模板文件可以在这里找到：
- [示例目录](https://github.com/lorcan-cloud/vue-auto-router/tree/main/examples)
- [模板文件](https://github.com/lorcan-cloud/vue-auto-router/blob/main/examples/route-template.js)

## License

[MIT](https://github.com/lorcan-cloud/vue-auto-router/blob/main/LICENSE)

## 作者

[lorcan-cloud](https://github.com/lorcan-cloud)
