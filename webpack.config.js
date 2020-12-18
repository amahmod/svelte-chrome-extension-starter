const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ExtensionReloader = require("webpack-extension-reloader");
const webpack = require("webpack");

const mode = process.env.NODE_ENV || "development";
const prod = mode === "production";

const config = {
  context: path.resolve(__dirname, "./src"),
  entry: {
    options: ["./options/options.js"],
    background: ["./background/background.js"],
    content: ["./content/content.js"],
  },
  resolve: {
    alias: {
      svelte: path.resolve("node_modules", "svelte"),
    },
    extensions: [".mjs", ".js", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"],
    fullySpecified: false,
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
    chunkFilename: "[name].[id].js",
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: "svelte-loader",
          options: {
            emitCss: false,
            hotReload: false,
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          /**
           * MiniCssExtractPlugin doesn't support HMR.
           * For developing, use 'style-loader' instead.
           * */
          prod ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
        ],
      },
      {
        test: /\.scss$/,
        use: [
          prod ? MiniCssExtractPlugin.loader : "style-loader",
          "sass-loader",
          "css-loader",
        ],
      },
    ],
  },
  mode,
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new HtmlWebpackPlugin({
      title: "Options",
      template: "./options/options.html",
      filename: "options.html",
      chunks: ["options"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "assets", to: "assets" },
        { from: "manifest.json", to: "manifest.json" },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
  stats: {
    assetsSort: "!size",
    children: false,
    usedExports: false,
    modules: false,
    entrypoints: false,
    // Hide source maps from output
    excludeAssets: [/\.*\.map/],
  },
};
if (!prod) {
  config.plugins.push(
    new ExtensionReloader({
      reloadPage: true,
      entries: {
        contentScript: "content",
        background: "background",
        extensionPage: "options",
      },
    })
  );
}

module.exports = config;
