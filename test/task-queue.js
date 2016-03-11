/*!
 * test/task-queue.js
 */

define(function (require) {


/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

var assert = require('proclaim');
var sinon = require('sinon');
var TaskQueue = require('task-queue');


/* -----------------------------------------------------------------------------
 * test
 * ---------------------------------------------------------------------------*/

describe('task-queue.js', function () {

  beforeEach(function () {
    this.processed = [];

    this.queue = new TaskQueue(function (task, next) {
      this.processed.push(task.val);
      setTimeout(next, 0);
    }.bind(this));
  });

  it('Should add task to head of queue.', function () {
    var task = { val: 1 };
    this.queue.add(task);

    assert.equal(this.queue.tasks[0], task);
  });

  it('Should return true if queue is empty.', function () {
    assert.isTrue(this.queue.isEmpty());
  });

  it('Should return false if queue contains tasks.', function () {
    this.queue.add({ val: 1 });

    assert.isFalse(this.queue.isEmpty());
  });

  it('Should immediately process from head of queue.', function (done) {
    this.queue.add({ val: 1 }, true);

    setTimeout(function () {
      assert.isTrue(this.queue.isEmpty());
      assert.deepEqual(this.processed, [1]);
      done();
    }.bind(this), 100);
  });

  it('Should add to queue and process after current executing task.', function (done) {
    this.queue.add({ val: 1 }, true);
    this.queue.add({ val: 2 });

    setTimeout(function () {
      assert.isTrue(this.queue.isEmpty());
      assert.deepEqual(this.processed, [1, 2]);
      done();
    }.bind(this), 100);
  });

  it('Should add multiple tasks to queue.', function (done) {
    this.queue.add([
      { val: 1 },
      { val: 2 }
    ], true);

    setTimeout(function () {
      assert.isTrue(this.queue.isEmpty());
      assert.deepEqual(this.processed, [1, 2]);
      done();
    }.bind(this), 100);
  });

  it('Should not add duplicate entires to list.', function (done) {
    this.queue.add([
      { id: 1, val: 1 },
      { id: 1, val: 2 }
    ], true);

    setTimeout(function () {
      assert.isTrue(this.queue.isEmpty());
      assert.deepEqual(this.processed, [1]);
      assert.deepEqual(this.queue.indexes, {});
      done();
    }.bind(this), 100);
  });

  it('Should stop processing after last task.', function (done) {
    this.queue.add({ val: 1 }, true);

    setTimeout(function () {
      this.queue.add({ val: 2 });
    }.bind(this), 100);

    setTimeout(function () {
      assert.isFalse(this.queue.isEmpty());
      assert.deepEqual(this.processed, [1]);
      done();
    }.bind(this), 100);
  });

  it('Should clear queue and indexes.', function () {
    this.queue.add([
      { id: 1, val: 1 },
      { id: 2, val: 2 }
    ]);

    this.queue.clear();

    assert.isTrue(this.queue.isEmpty());
    assert.deepEqual(this.queue.tasks, []);
    assert.deepEqual(this.queue.indexes, {});
  });

  it('Should clear on process when flag set.', function () {
    this.queue.shiftOnProcess = true;
    this.queue.add({ val: 1 }, true);

    assert.deepEqual(this.queue.tasks, []);
  });

});


});