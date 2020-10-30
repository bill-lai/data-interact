const { resolve } = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: './src/export.js',
  output: {
    filename: './data-interact.js',
    path: resolve('dist'),
    library: 'responsive',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
                plugins: [
                  ["@babel/transform-runtime"]
                ]
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({paths: ["dist"] })
  ],
  mode: 'production'
}