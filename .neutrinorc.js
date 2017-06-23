'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const presetLibrary = require('neutrino-preset-library')

/* -----------------------------------------------------------------------------
 * config
 * -------------------------------------------------------------------------- */

module.exports = (neutrino) => {
  neutrino.use(presetLibrary, {
    library: 'TaskQueue',
    filename: 'task-queue.js'
  })
}
