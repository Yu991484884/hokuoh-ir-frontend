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
         target: "https://www.hokuoh-ir.online",
        //target: "http://localhost:8091",
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