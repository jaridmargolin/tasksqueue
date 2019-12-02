'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

import { terser } from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'

/* -----------------------------------------------------------------------------
 * rollup config
 * -------------------------------------------------------------------------- */

const sharedPlugins = [
  babel({
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
    exclude: 'node_modules/**'
  })
]

export default [
  {
    input: 'src/task-queue.ts',
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/task-queue',
      format: 'umd',
      name: 'TaskQueue'
    }
  },
  {
    input: 'src/task-queue.ts',
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/common/task-queue',
      format: 'cjs'
    }
  },
  {
    input: 'src/task-queue.ts',
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/es/task-queue',
      format: 'es'
    }
  },
  {
    input: 'src/task-queue.ts',
    plugins: [...sharedPlugins, terser()],
    output: {
      file: 'dist/task-queue.min.js',
      format: 'umd',
      name: 'TaskQueue'
    }
  }
]
