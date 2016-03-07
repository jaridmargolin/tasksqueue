(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function () {
      return (root.returnExportsGlobal = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['TaskQueue'] = factory();
  }
}(this, function () {

/*!
 * isArray.js
 * 
 * Copyright (c) 2014
 */
var utlIsArray, taskQueue;
utlIsArray = function (value) {
  return Object.prototype.toString.call(value) === '[object Array]';
};
/*!
 * task-queue.js
 */
taskQueue = function (require) {
  /* -----------------------------------------------------------------------------
   * dependencies
   * ---------------------------------------------------------------------------*/
  var isArray = utlIsArray;
  /* -----------------------------------------------------------------------------
   * TaskQueue
   * ---------------------------------------------------------------------------*/
  /**
   * @global
   * @public
   * @constructor
   *
   * @name TaskQueue
   * @desc Extensible async task queue.
   *
   * @example
   * var queue = new TaskQueue(function (task, next) {
   *   task.fn(task.opts, next);
   * });
   *
   * @param {Function} processFn - Function called when task is processed.
   */
  var TaskQueue = function (processFn) {
    this.processFn = processFn;
    this.tasks = [];
    this.indexes = {};
    // respect any values set in subclasses
    this.indexName = this.indexName || 'id';
  };
  /**
   * @public
   * @memberof TaskQueue
   *
   * @desc Add item(s) to queue. Optionally being processing queue.
   *
   * @example
   * queue.add({ 'id': 1, args: arguments }, true);
   *
   * @param {Array|Object} tasks - An array or single task to add to queue.
   */
  TaskQueue.prototype.add = function (tasks, processTask) {
    var isEmpty = this.isEmpty();
    var result = isArray(tasks) ? this._addTasks(tasks) : this._addTask(tasks);
    if (isEmpty && processTask) {
      this.process();
    }
    return result;
  };
  /**
   * @public
   * @memberof TaskQueue
   *
   * @desc Check to determine if queue is empty. Queue is considered empty
   *   if the tasks array has a length of 0.
   *
   * @example
   * queue.isEmpty();
   */
  TaskQueue.prototype.isEmpty = function () {
    return !this.tasks.length;
  };
  /**
   * @public
   * @memberof TaskQueue
   *
   * @desc Proccess task found at the head of the queue.
   *
   * @example
   * queue.process();
   */
  TaskQueue.prototype.process = function () {
    var self = this;
    this.processFn(this._shift(), function () {
      return self.isEmpty() ? null : self.process.call(self);
    });
  };
  /* -----------------------------------------------------------------------------
   * internal/helpers
   * ---------------------------------------------------------------------------*/
  /**
   * @private
   * @memberof TaskQueue
   *
   * @desc Add item(s) to queue.
   *
   * @param {Array} tasks - Loop over passed tasks abd add each to queue.
   */
  TaskQueue.prototype._addTasks = function (tasks) {
    var added = [];
    for (var i = 0, l = tasks.length; i < l; i++) {
      added.push(this._addTask(tasks[i]));
    }
    return added;
  };
  /**
   * @private
   * @memberof TaskQueue
   *
   * @desc Add item to queue. Small wrapper around push that first checks
   *   if task is a duplicate.
   *
   * @param {Object} task - A single task item. Can contain any desired properties.
   */
  TaskQueue.prototype._addTask = function (task) {
    if (!this._isDuplicate(task)) {
      this._push(task);
    }
    return task;
  };
  /**
   * @private
   * @memberof TaskQueue
   *
   * @desc Check if task is a duplicate. By default it checks against a map of
   *   index. Override if duplicate check requires additional logic.
   *
   * @param {Object} task - A single task item.
   */
  TaskQueue.prototype._isDuplicate = function (task) {
    return this.indexes.hasOwnProperty(task[this.indexName]);
  };
  /**
   * @private
   * @memberof TaskQueue
   *
   * @desc Push task object to tail of tasks list and add to indexes map.
   *
   * @param {Object} task - A single task item.
   */
  TaskQueue.prototype._push = function (task) {
    var indexVal = this.tasks.push(task) - 1;
    if (task.hasOwnProperty(this.indexName)) {
      this.indexes[task[this.indexName]] = indexVal;
    }
  };
  /**
   * @private
   * @memberof TaskQueue
   *
   * @desc Remove and return the task at the head of the tasks list. Also removes
   *   task from indexes map.
   */
  TaskQueue.prototype._shift = function () {
    var task = this.tasks.shift();
    delete this.indexes[task.indexName];
    return task;
  };
  /* -----------------------------------------------------------------------------
   * expose
   * ---------------------------------------------------------------------------*/
  return TaskQueue;
}({});

return taskQueue;


}));