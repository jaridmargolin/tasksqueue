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
    input: 'src/tasks-queue.ts',
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/tasks-queue',
      format: 'umd',
      name: 'TasksQueue'
    }
  },
  {
    input: 'src/tasks-queue.ts',
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/common/tasks-queue',
      format: 'cjs'
    }
  },
  {
    input: 'src/tasks-queue.ts',
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/es/tasks-queue',
      format: 'es'
    }
  },
  {
    input: 'src/tasks-queue.ts',
    plugins: [...sharedPlugins, terser()],
    output: {
      file: 'dist/tasks-queue.min.js',
      format: 'umd',
      name: 'TasksQueue'
    }
  }
]
