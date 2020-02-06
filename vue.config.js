const webpack = require('webpack');
const path = require('path');

module.exports = {
  transpileDependencies: [
    'vuetify',
  ],
  devServer: {
    disableHostCheck: true,
  },
  configureWebpack: config => ({
    target: 'electron-renderer',
    plugins: [
      new webpack.DefinePlugin({
        __dirname: JSON.stringify(__dirname),
        __public: JSON.stringify(path.join(__dirname, 'public')),
      }),
    ],
  }),
};
