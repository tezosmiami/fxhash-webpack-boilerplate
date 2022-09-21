const fs = require('fs');
const path = require("path")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "bundle.js",
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.compile.tap("pfp-preprocessor", () => {
          const layersDir = path.resolve(__dirname, "..", "public", "layers");
          const outputFile = path.resolve("./tmp", "layers.json");

          const output = {};

          fs.readdirSync(layersDir, { withFileTypes: true })
            .filter(entry => entry.isDirectory())
            .map(branch => branch.name)
            .forEach(branch=> {
              output[branch] = {};
                fs.readdirSync(path.resolve(layersDir,branch), { withFileTypes: true })
                .filter(e => e.isDirectory())
                .map(dir => dir.name)
                .forEach(dir => {
                  console.log(dir)
                  output[branch][dir] = [];
                fs.readdirSync(path.resolve(layersDir, branch, dir))
                 .filter(file => file.toLowerCase().endsWith('.png'))
                 .forEach(file => {
                  console.log(file)
                  output[branch][dir].push(file);
                });
            });
          });
console.log(output)
          fs.writeFileSync(outputFile, JSON.stringify(output));
        });
      },
    },
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      inject: "body",
      publicPath: "./"
    })
  ]
}