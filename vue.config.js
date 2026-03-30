const { defineConfig } = require("@vue/cli-service");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,

  devServer: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: "all",
    proxy: {
      "/api": {
        target: "http://www.hokuoh-ir.online",
        changeOrigin: true,
        pathRewrite: {
          "^/api": ""
        }
      },
    },
  },

  configureWebpack: {
    plugins: [
      new CopyPlugin({
        patterns: [{ from: "netlify.toml", to: "" }],
      }),
    ],
  },
});