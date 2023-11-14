module.exports = {
  // ...其他配置

  module: {
    rules: [
      // ...其他规则
    ]
  },
  // 忽略特定文件或目录
  ignoreWarnings: [
    {
      module: /\/node_modules\/cpu-features\//,
    }
  ]
};
