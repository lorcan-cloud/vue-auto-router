# @lorcan-store/vue-auto-router

一个基于 Vite 的 Vue 路由自动生成插件。该插件会自动扫描指定目录下的 Vue 文件，并根据文件结构生成对应的路由配置。

[English](README.md) | [简体中文](README.zh-CN.md)

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
      forceOverwrite: ['home'],       // 强制覆盖的目录列表
      language: 'CN'                  // 控制台输出语言（CN 或 EN）
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
| forceOverwrite | string[] | [] | 强制覆盖的目录名称列表 |
| routeTemplate | string | undefined | 自定义路由模板文件路径 |
| language | 'EN' \| 'CN' | 'EN' | 控制台输出语言 |

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

## 路由生成规则

1. **文件导入规则**
   - Vue 文件会被转换为动态导入
   - 组件名使用帕斯卡命名法（PascalCase）
   - 导入路径会转换为 @ 别名形式
   - 示例：
     * house-build.vue -> const HouseBuild
     * user_profile.vue -> const UserProfile
     * data_analysis-chart.vue -> const DataAnalysisChart

2. **路由路径规则**
   - 路径使用目录名全小写，保持原有的分隔符
   - index.vue 对应空路径
   - 其他文件名直接作为子路径
   - 示例：
     * /pages/user-center/index.vue -> path: ''
     * /pages/user-center/user-info.vue -> path: 'user-info'
     * /pages/data_analysis/data_chart.vue -> path: 'data_chart'

3. **路由名称规则**
   - 使用目录名转换为帕斯卡命名法
   - 子路由会附加文件名（转换为帕斯卡命名法）
   - 示例：
     * user-center/index.vue -> name: 'UserCenter'
     * user-center/user-info.vue -> name: 'UserCenterUserInfo'
     * data_analysis/data_chart.vue -> name: 'DataAnalysisDataChart'

## 自定义路由模板

你可以通过 routeTemplate 配置项指定一个自定义的路由模板文件：

> 💡 提示：你可以在 [GitHub 仓库](https://github.com/lorcan-cloud/vue-auto-router/blob/master/template/route-template.js) 中找到完整的模板示例文件。

模板文件需要导出一个函数，该函数接收三个参数：
1. dirName: string - 当前目录名
2. files: string[] - 该目录下的 Vue 文件路径
3. context: Object - 额外的上下文信息

更多详情和示例请查看仓库中的模板文件。

## 注意事项

1. 确保项目中已安装最新版本的 `vue-router`
2. 布局组件默认位于 `src/pages/layout/index.vue`
3. 路由配置文件会生成在指定的输出目录中
4. 每个目录会生成独立的路由文件
5. 已存在的路由文件不会被覆盖，除非在 forceOverwrite 列表中
6. 删除已存在的路由文件后，需要重启服务器以重新生成

## 开发环境

插件会在以下情况检查并生成路由配置：
1. 开发服务器启动时
2. 添加新的 .vue 文件时
3. 删除 .vue 文件时
4. 修改 .vue 文件时
5. 项目构建开始时

## License

[MIT](https://github.com/lorcan-cloud/vue-auto-router/blob/master/LICENSE) 