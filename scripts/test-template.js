const { RouteGenerator } = require('../dist/generator');
const path = require('path');

// 测试用例
const testCases = [
  {
    dirName: 'user-center',
    files: [
      '@/pages/user-center/index.vue',
      '@/pages/user-center/user-info.vue',
      '@/pages/user-center/edit-profile.vue'
    ]
  },
  {
    dirName: 'data_analysis',
    files: [
      '@/pages/data_analysis/index.vue',
      '@/pages/data_analysis/data_chart.vue',
      '@/pages/data_analysis/export-data.vue'
    ]
  }
];

// 创建生成器实例
const generator = new RouteGenerator({
  routeTemplate: path.join(__dirname, '../examples/route-template.js')
});

// 测试模板生成
console.log('Testing route template generation...\n');

testCases.forEach(test => {
  console.log(`Testing directory: ${test.dirName}`);
  console.log('Files:');
  console.log(test.files);
  console.log('\nGenerated content:');
  
  const content = generator.generateRouteFileContent(
    [], // routes 参数在使用自定义模板时不重要
    test.files.map(file => ({
      name: path.basename(file, '.vue'),
      path: file
    }))
  );
  
  console.log(content);
  console.log('---\n');
}); 