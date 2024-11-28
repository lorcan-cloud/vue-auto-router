const { RouteGenerator } = require('../dist/generator');

// 测试用例
const testCases = [
  {
    file: 'src/pages/user-center/user-info.vue',
    expect: {
      component: 'UserInfo',
      path: 'user-info',
      name: 'UserCenterUserInfo'
    }
  },
  {
    file: 'src/pages/data_analysis/data_chart.vue',
    expect: {
      component: 'DataChart',
      path: 'data_chart',
      name: 'DataAnalysisDataChart'
    }
  },
  {
    file: 'src/pages/house-build/house_detail-info.vue',
    expect: {
      component: 'HouseDetailInfo',
      path: 'house_detail-info',
      name: 'HouseBuildHouseDetailInfo'
    }
  }
];

// 创建生成器实例
const generator = new RouteGenerator({});

// 测试命名规则
console.log('Testing naming conventions...\n');

testCases.forEach(test => {
  console.log(`Testing file: ${test.file}`);
  console.log('Expected:');
  console.log(test.expect);
  console.log('Got:');
  console.log({
    component: generator.getComponentName(test.file),
    path: generator.getSubRoutePath(test.file),
    name: generator.getRouteName(
      test.file.split('/')[2], // 目录名
      test.file
    )
  });
  console.log('---\n');
}); 