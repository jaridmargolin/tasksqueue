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
    input: 'src/tasksqueue.ts',
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/tasksqueue',
      format: 'umd',
      name: 'TasksQueue'
    }
  },
  {
    input: 'src/tasksqueue.ts',
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/common/tasksqueue',
      format: 'cjs'
    }
  },
  {
    input: 'src/tasksqueue.ts',
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/es/tasksqueue',
      format: 'es'
    }
  },
  {
    input: 'src/tasksqueue.ts',
    plugins: [...sharedPlugins, terser()],
    output: {
      file: 'dist/tasksqueue.min.js',
      format: 'umd',
      name: 'TasksQueue'
    }
  }
]
