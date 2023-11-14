module.exports = {
    pluginOptions: {
      electronBuilder: {
        builderOptions: {
          appId: 'com.example.myapp',
          productName: 'tools',
          directories: {
            output: 'dist_electron'
          },
          // 更多选项...
        }
      }
    },
    runtimeCompiler: true
  };
  