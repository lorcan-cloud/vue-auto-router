# @lorcan-store/vue-auto-router

A Vite plugin for automatically generating Vue router configuration based on file structure.

[English](README.md) | [简体中文](README.zh-CN.md)

## Features

- 🚀 Auto-scan Vue files in specified directory
- 📁 Generate route configuration based on file structure
- ⚙️ Support custom scan and output directories
- 🔍 Support file exclusion configuration
- 🔄 Support hot update in development
- 📦 Support latest versions of Vite and Vue Router
- 🎯 Generate route files named by directory

## Installation

```bash
npm install @lorcan-store/vue-auto-router -D
# or
yarn add @lorcan-store/vue-auto-router -D
# or
pnpm add @lorcan-store/vue-auto-router -D
```

## Usage

Configure in `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueAutoRouter from '@lorcan-store/vue-auto-router'

export default defineConfig({
  plugins: [
    vue(),
    VueAutoRouter({
      // Configuration options
      scanDir: 'src/pages',           // Directory to scan
      outputDir: 'src/router/',       // Output directory
      exclude: ['layout'],            // Directories to exclude
      layoutPath: '@/pages/layout/index.vue',  // Layout component path
      forceOverwrite: ['home'],       // Directories to force overwrite
      language: 'EN'                  // Console output language (EN or CN)
    })
  ]
})
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| scanDir | string | 'src/pages' | Root directory to scan |
| outputDir | string | 'src/router/' | Output directory for route files |
| exclude | string[] | [] | Directory names to exclude |
| layoutPath | string | '@/pages/layout/index.vue' | Layout component path |
| forceOverwrite | string[] | [] | Directory names to force overwrite |
| routeTemplate | string | undefined | Custom route template file path |
| language | 'EN' \| 'CN' | 'EN' | Console output language |

## Directory Structure Example

```
src/
  pages/              # scanDir points here
    layout/           # Layout component directory (usually excluded)
      index.vue      # Layout component
    home/            # Home module (generates home.ts)
      index.vue     # Home page
      about.vue     # About page
    user_manager/    # User management module (generates user_manager.ts)
      index.vue     # List page
      form.vue      # Form page
```

## Route Generation Rules

1. **File Import Rules**
   - Vue files are converted to dynamic imports
   - Component names use PascalCase
   - Import paths are converted to @ alias form
   - Example:
     * house-build.vue -> const HouseBuild
     * user_profile.vue -> const UserProfile
     * data_analysis-chart.vue -> const DataAnalysisChart

2. **Route Path Rules**
   - Paths use lowercase directory names, keeping original separators
   - index.vue maps to empty path
   - Other file names are used as sub-paths
   - Example:
     * /pages/user-center/index.vue -> path: ''
     * /pages/user-center/user-info.vue -> path: 'user-info'
     * /pages/data_analysis/data_chart.vue -> path: 'data_chart'

3. **Route Name Rules**
   - Uses directory name in PascalCase
   - Sub-routes append file name in PascalCase
   - Example:
     * user-center/index.vue -> name: 'UserCenter'
     * user-center/user-info.vue -> name: 'UserCenterUserInfo'
     * data_analysis/data_chart.vue -> name: 'DataAnalysisDataChart'

## Custom Route Template

You can specify a custom route template file:

> 💡 Tip: You can find the complete template example in the [GitHub repository](https://github.com/lorcan-cloud/vue-auto-router/blob/master/template/route-template.js).

The template file should export a function that receives three parameters:
1. dirName: string - Current directory name
2. files: string[] - Vue file paths in the directory
3. context: Object - Additional context information

For more details and examples, check the template file in the repository.

## Notes

1. Make sure you have the latest version of `vue-router` installed
2. Layout component is expected at `src/pages/layout/index.vue` by default
3. Route files are generated in the specified output directory
4. Each directory generates a separate route file
5. Existing route files won't be overwritten unless in forceOverwrite list
6. After deleting existing route files, restart the server to regenerate

## Development Environment

The plugin will check and generate route configuration in these cases:
1. When development server starts
2. When adding new .vue files
3. When deleting .vue files
4. When modifying .vue files
5. When building starts

## License

[MIT](https://github.com/lorcan-cloud/vue-auto-router/blob/master/LICENSE)
