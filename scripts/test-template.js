const { RouteGenerator } = require('../dist/generator');
const path = require('path');

// 测试用例
const testCases = [
  {
    dirName: 'user-center',
    files: [
      '@/pages/user-center/index.vue',
      '@/pages/user-center/user-info.vue',
      '@/pages/user-center/edit-profile.vue',
      '@/pages/user-center/change-password.vue'
    ]
  },
  {
    dirName: 'data_analysis',
    files: [
      '@/pages/data_analysis/index.vue',
      '@/pages/data_analysis/data_chart.vue',
      '@/pages/data_analysis/export-data.vue',
      '@/pages/data_analysis/chart_detail.vue'
    ]
  },
  {
    dirName: 'system-settings',
    files: [
      '@/pages/system-settings/index.vue',
      '@/pages/system-settings/basic-info.vue',
      '@/pages/system-settings/security_config.vue',
      '@/pages/system-settings/user-management.vue'
    ]
  }
];

// 创建生成器实例，使用自定义模板
const generator = new RouteGenerator({
  routeTemplate: path.join(__dirname, '../template/route-template.js'),
  layoutPath: '@/layout/index.vue'  // 测试自定义布局路径
});

// 测试模板生成
console.log('Testing route template generation...\n');

testCases.forEach(test => {
  console.log(`Testing directory: ${test.dirName}`);
  console.log('Files:');
  console.log(test.files.map(f => `  - ${f}`).join('\n'));
  console.log('\nGenerated content:');
  
  const content = generator.generateRouteFileContent(
    [], // routes 参数在使用自定义模板时不重要
    test.files.map(file => ({
      name: path.basename(file, '.vue'),
      path: file
    }))
  );
  
  console.log(content);
  console.log('\n' + '='.repeat(80) + '\n');
});

// 测试默认模板
console.log('Testing default template...\n');
const defaultGenerator = new RouteGenerator({
  layoutPath: '@/layout/index.vue'
});

const defaultCase = testCases[0];
const defaultContent = defaultGenerator.generateRouteFileContent(
  [],
  defaultCase.files.map(file => ({
    name: path.basename(file, '.vue'),
    path: file
  }))
);

console.log('Default template output:');
console.log(defaultContent); 