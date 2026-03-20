const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/browser/index.ts',
  target: 'web',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, 'tsconfig.webpack.json'),
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist-web'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/browser/index.html',
      title: 'LaTeX HTML demo',
    }),
  ],
};
