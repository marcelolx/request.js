import resolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"

import { version } from "./package.json"
const year = new Date().getFullYear()
const banner = `/*\nRails Request.JS ${version}\nCopyright © ${year} Basecamp, LLC\n */`

export default [
  {
    input: "src/index.ts",
    output: [
      {
        name: "Request.JS",
        file: "dist/requestjs.es5-umd.js",
        format: "umd",
        sourcemap: true,
        banner
      }
    ],
    plugins: [
      resolve(),
      typescript({ target: "es5", downlevelIteration: true })
    ],
    watch: {
      include: "src/**"
    }
  },

  {
    input: "src/index.ts",
    output: [
      {
        name: "Request.JS",
        file: "dist/requestjs.es2017-umd.js",
        format: "umd",
        sourcemap: true,
        banner
      },
      {
        file: "dist/requestjs.es2017-esm.js",
        format: "es",
        sourcemap: true,
        banner
      }
    ],
    plugins: [
      resolve(),
      typescript()
    ],
    watch: {
      include: "src/**"
    }
  }
]