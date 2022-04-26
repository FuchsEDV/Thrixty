import path from "path";
import { Configuration } from "webpack";

const config: Configuration = {
  entry: "./src/Thrixty.ts",
  mode: "development",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(ts|js)?$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-typescript"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "thrixty"),
    filename: "thrixty.js",
  },
};
export default config;