/*!
 * test/_umd.js
 */

define(function (require) {


/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

var assert = require('proclaim');
var TaskQueue = require('task-queue/task-queue');


/* -----------------------------------------------------------------------------
 * test
 * ---------------------------------------------------------------------------*/

describe('umd - task-queue.js', function () {

  it('Should create a new instance.', function () {
    var queue = new TaskQueue();

    assert.isInstanceOf(queue, TaskQueue);
  });

});


});