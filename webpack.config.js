const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ProvidePlugin = require("webpack").ProvidePlugin;
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const packageJson = require("./package.json");
const ExternalRemotesPlugin = require("external-remotes-plugin");

module.exports = (env, arg) => ({
  // entry: ['./src/app.js', './src/sass/base.scss'],
  mode: "production",
  output: {
    filename: "[name].[contenthash].js",
    publicPath: "auto",
  },
  optimization: {
    minimize: true,
    runtimeChunk: false,
    splitChunks: false,
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
    fallback: {
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
      constants: false,
      fs: false,
      path: require.resolve("path-browserify"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-typescript",
            ],
            plugins: ["@babel/plugin-transform-runtime"],
          },
        },
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader",
        options: {
         name: '[path][name].[ext]',
         limit: 10000,
       } 
     },
      {
        test: /\.(ttf|eot|svg|png|jpg|jpeg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader",
        options: {
          name: '[path][name].[ext]',
        }
      },
      {
        test: /\.scss$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: "css-loader" },
          {
            loader: "sass-loader",
            options: {
              sourceMap: false
            }
          }],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.m?js$/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  plugins: [
    {
      // anonymous plugin
      apply(compiler) {
        compiler.hooks.beforeRun.tapAsync(
          "MyCustomBeforeRunPlugin",
          function (compiler, callback) {
            // debugger
            console.dir(compiler.options);
            callback();
          }
        );
      },
    },
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./public/index.html"),
      publicPath: "/",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "./assets"),
          to: path.resolve(__dirname, "./dist"),
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
    new ModuleFederationPlugin({
      name: "engine",
      filename: "remoteEntry.js",
      exposes: {
        "./Editor": "./src/Editor.js",
      },
      remotes: {
        dtk: "storybook@https://dtk.suncoast.systems/remoteEntry.js",
        common: "common@https://commonjs.suncoast.systems/remoteEntry.js",
      },
      shared: {
        ...packageJson.dependencies,
        react: {
          singleton: true,
          requiredVersion: packageJson.dependencies.react,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: packageJson.dependencies["react-dom"],
        },
      },
    }),
    new ExternalRemotesPlugin(),
  ],
});
