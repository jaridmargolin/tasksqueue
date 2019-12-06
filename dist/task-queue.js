(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.TaskQueue = {}));
}(this, (function (exports) { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  (function (TaskQueueStatus) {
    TaskQueueStatus[TaskQueueStatus["WAITING"] = 0] = "WAITING";
    TaskQueueStatus[TaskQueueStatus["PROCESSING"] = 1] = "PROCESSING";
    TaskQueueStatus[TaskQueueStatus["PAUSED"] = 2] = "PAUSED";
    TaskQueueStatus[TaskQueueStatus["PAUSED_PROCESSING"] = 3] = "PAUSED_PROCESSING";
  })(exports.TaskQueueStatus || (exports.TaskQueueStatus = {}));

  var TaskQueue =
  /*#__PURE__*/
  function () {
    /**
     * @desc Extensible async task queue.
     *
     * @example
     * const queue = new TaskQueue((task, next) => {
     *   task.fn(task.opts, next)
     * })
     *
     * @param taskHandler - Function called when task is processed.
     * @param taskQueueSettings - TaskQueue configuration options.
     */
    function TaskQueue(taskHandler) {
      var taskQueueSettings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, TaskQueue);

      _defineProperty(this, "status", exports.TaskQueueStatus.WAITING);

      _defineProperty(this, "tasks", []);

      _defineProperty(this, "indexes", {});

      _defineProperty(this, "_handler", void 0);

      _defineProperty(this, "_settings", {
        indexKey: 'id',
        shiftOnProcess: false
      });

      this._handler = taskHandler;
      Object.assign(this._settings, taskQueueSettings);
    }
    /**
     * @desc Add item(s) to queue. Optionally being processing queue.
     *
     * @example
     * queue.add({ 'id': 1, args: arguments }, true)
     *
     * @param tasks - An array or single task to add to queue.
     */


    _createClass(TaskQueue, [{
      key: "add",
      value: function add(tasks) {
        var isEmpty = this.isEmpty();
        var result = Array.isArray(tasks) ? this._addTasks(tasks) : this._addTask(tasks);

        if (isEmpty) {
          this.process();
        }

        return result;
      }
      /**
       * @desc Check to determine if queue is empty. Queue is considered empty
       *   if the tasks array has a length of 0.
       *
       * @example
       * queue.isEmpty()
       */

    }, {
      key: "isEmpty",
      value: function isEmpty() {
        return !this.tasks.length;
      }
      /**
       * @desc Proccess task found at the head of the queue.
       *
       * @example
       * queue.process()
       */

    }, {
      key: "process",
      value: function process() {
        var _this = this;

        if (this.status === exports.TaskQueueStatus.WAITING) {
          var _task = this._settings.shiftOnProcess ? this._shift() : this.tasks[0];

          if (typeof _task !== 'undefined') {
            this.status = exports.TaskQueueStatus.PROCESSING;
            Promise.resolve(this._handler(_task)).then(function () {
              return _this._next();
            });
          }
        }
      }
      /**
       * @desc Pauses a queue. If the queue was processing, the queue will halt
       * moving to the next task. The current task will continue executing.
       *
       * @example
       * queue.pause()
       */

    }, {
      key: "pause",
      value: function pause() {
        this.status = this.status === exports.TaskQueueStatus.PROCESSING ? exports.TaskQueueStatus.PAUSED_PROCESSING : exports.TaskQueueStatus.PAUSED;
      }
      /**
       * @desc Resumes a paused queue. If queue was paused while processing, it
       * will continue to process.
       *
       * @example
       * queue.resume()
       */

    }, {
      key: "resume",
      value: function resume() {
        if (this.status === exports.TaskQueueStatus.PAUSED) {
          this.status = exports.TaskQueueStatus.WAITING;
          this.process();
        } else if (this.status === exports.TaskQueueStatus.PAUSED_PROCESSING) {
          this.status = exports.TaskQueueStatus.PROCESSING;
        }
      }
      /**
       * @desc Clear all currently queued tasks.
       *
       * @example
       * queue.clear()
       */

    }, {
      key: "clear",
      value: function clear() {
        for (var i = 0, l = this.tasks.length; i < l; i++) {
          delete this.indexes[this.tasks[i][this._settings.indexKey]];
        }

        this.tasks.length = 0;
      }
      /* ---------------------------------------------------------------------------
       * internal/helpers
       * ------------------------------------------------------------------------ */

      /**
       * @desc Add item(s) to queue.
       *
       * @param tasks - Loop over passed tasks abd add each to queue.
       */

    }, {
      key: "_addTasks",
      value: function _addTasks(tasks) {
        var added = [];

        for (var i = 0, l = tasks.length; i < l; i++) {
          added.push(this._addTask(tasks[i]));
        }

        return added;
      }
      /**
       * @desc Add item to queue. Small wrapper around push that first checks
       *   if task is a duplicate.
       *
       * @param task - A single task item. Can contain any desired properties.
       */

    }, {
      key: "_addTask",
      value: function _addTask(task) {
        if (!this._isDuplicate(task)) {
          this._push(task);
        }

        return task;
      }
      /**
       * @desc Check if task is a duplicate. By default it checks against a map of
       *   index. Override if duplicate check requires additional logic.
       *
       * @param task - A single task item.
       */

    }, {
      key: "_isDuplicate",
      value: function _isDuplicate(task) {
        return this.indexes.hasOwnProperty(task[this._settings.indexKey]);
      }
      /**
       * @desc Push task object to tail of tasks list and add to indexes map.
       *
       * @param task - A single task item.
       */

    }, {
      key: "_push",
      value: function _push(task) {
        var indexVal = this.tasks.push(task) - 1;

        if (task.hasOwnProperty(this._settings.indexKey)) {
          this.indexes[task[this._settings.indexKey]] = indexVal;
        }
      }
      /**
       * @desc Remove and return the task at the head of the tasks list. Also removes
       *   task from indexes map.
       */

    }, {
      key: "_shift",
      value: function _shift() {
        var task = this.tasks.shift();
        task && delete this.indexes[task[this._settings.indexKey]];
        return task;
      }
      /**
       * @desc Continue to next task
       */

    }, {
      key: "_next",
      value: function _next() {
        !this._settings.shiftOnProcess && this._shift();

        if (this.status === exports.TaskQueueStatus.PROCESSING) {
          this.status = exports.TaskQueueStatus.WAITING;
          this.process();
        } else if (this.status === exports.TaskQueueStatus.PAUSED_PROCESSING) {
          this.status = exports.TaskQueueStatus.PAUSED;
        }
      }
    }]);

    return TaskQueue;
  }();

  exports.default = TaskQueue;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
