'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'

/* -----------------------------------------------------------------------------
 * rollup config
 * -------------------------------------------------------------------------- */

const externals = [
  'core-js/modules/es.object.assign',
  'core-js/modules/es.object.to-string',
  'core-js/modules/es.promise'
]

const sharedPlugins = [
  resolve({
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json']
  }),
  commonjs(),
  babel({
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
    exclude: 'node_modules/**'
  })
]

export default [
  {
    input: 'src/task-queue.ts',
    external: externals,
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/common/task-queue.js',
      format: 'cjs',
      exports: 'named'
    }
  },
  {
    input: 'src/task-queue.ts',
    external: externals,
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/es/task-queue.js',
      format: 'es'
    }
  },
  {
    input: 'src/task-queue.ts',
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/task-queue.js',
      format: 'umd',
      name: 'TaskQueue',
      exports: 'named'
    }
  },
  {
    input: 'src/task-queue.ts',
    plugins: [...sharedPlugins, terser()],
    output: {
      file: 'dist/task-queue.min.js',
      format: 'umd',
      name: 'TaskQueue',
      exports: 'named'
    }
  }
]
