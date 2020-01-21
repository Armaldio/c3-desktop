const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

console.log('__dirname', __dirname);

module.exports = {
  transpileDependencies: [
    'vuetify',
  ],
  devServer: {
      disableHostCheck: true
  },
  configureWebpack: config => ({
    plugins: [
      new webpack.DefinePlugin({
        __dirname: JSON.stringify(__dirname),
        __public: JSON.stringify(path.join(__dirname, 'public')),
      }),
    ],
  }),
};
