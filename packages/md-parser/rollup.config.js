// Contents of the file /rollup.config.js
import typescript from '@rollup/plugin-typescript'
import dts from "rollup-plugin-dts"
import localResolve from 'rollup-plugin-local-resolve'

const config = [
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/md-parser.js',
      format: 'es',
      sourcemap: true,
    },
    external: ['@ruslan-sedziukh/md-types', 'fs'],
    plugins: [typescript(), localResolve()]
  },
  {
    input: 'dist/index.d.ts',
    output: {
      file: 'dist/md-parser.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
]

export default config
