const webpack = require('webpack');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

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
        // __dirname: JSON.stringify(__dirname),
      }),
    ],
  }),
};
