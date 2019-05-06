const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const webpack = require("webpack");

module.exports = merge(common, {
  mode: "development",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    globalObject: "this"
  },
  optimization: {
    splitChunks: {
      chunks: "all"
    }
  },
  devtool: "source-map",
  devServer: {
    historyApiFallback: true,
    hot: true
  },

  plugins: [
    // base route
    new webpack.DefinePlugin({
      BASENAME: JSON.stringify("/")
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
});
