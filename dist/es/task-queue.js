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

/* -----------------------------------------------------------------------------
 * TaskQueue
 * -------------------------------------------------------------------------- */
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
   * @param taskQueueOptions - TaskQueue configuration options.
   */
  function TaskQueue(taskHandler) {
    var taskQueueOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, TaskQueue);

    var _taskQueueOptions$ind = taskQueueOptions.indexName,
        indexName = _taskQueueOptions$ind === void 0 ? 'id' : _taskQueueOptions$ind,
        _taskQueueOptions$shi = taskQueueOptions.shiftOnProcess,
        shiftOnProcess = _taskQueueOptions$shi === void 0 ? false : _taskQueueOptions$shi;
    this.taskHandler = taskHandler;
    this.indexName = indexName;
    this.shiftOnProcess = shiftOnProcess;
    this.tasks = [];
    this.indexes = {};
  }
  /**
   * @desc Add item(s) to queue. Optionally being processing queue.
   *
   * @example
   * queue.add({ 'id': 1, args: arguments }, true)
   *
   * @param tasks - An array or single task to add to queue.
   * @param processImmediately - Flag determing whether or not to
   *   immediately "process" task.
   */


  _createClass(TaskQueue, [{
    key: "add",
    value: function add(tasks, processImmediately) {
      var isEmpty = this.isEmpty();
      var result = Array.isArray(tasks) ? this._addTasks(tasks) : this._addTask(tasks);

      if (isEmpty && processImmediately) {
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

      var task = this.shiftOnProcess ? this._shift() : this.tasks[0];

      if (typeof task !== 'undefined') {
        Promise.resolve(this.taskHandler(task)).then(function () {
          !_this.shiftOnProcess && _this._shift();

          _this.process();
        });
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
        delete this.indexes[this.tasks[i][this.indexName]];
      }

      this.tasks.length = 0;
    }
    /* ---------------------------------------------------------------------------
     * internal/helpers
     * ------------------------------------------------------------------------ */

    /**
     * @private
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
     * @private
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
     * @private
     * @desc Check if task is a duplicate. By default it checks against a map of
     *   index. Override if duplicate check requires additional logic.
     *
     * @param task - A single task item.
     */

  }, {
    key: "_isDuplicate",
    value: function _isDuplicate(task) {
      return this.indexes.hasOwnProperty(task[this.indexName]);
    }
    /**
     * @private
     * @desc Push task object to tail of tasks list and add to indexes map.
     *
     * @param task - A single task item.
     */

  }, {
    key: "_push",
    value: function _push(task) {
      var indexVal = this.tasks.push(task) - 1;

      if (task.hasOwnProperty(this.indexName)) {
        this.indexes[task[this.indexName]] = indexVal;
      }
    }
    /**
     * @private
     * @desc Remove and return the task at the head of the tasks list. Also removes
     *   task from indexes map.
     */

  }, {
    key: "_shift",
    value: function _shift() {
      var task = this.tasks.shift();
      task && delete this.indexes[task[this.indexName]];
      return task;
    }
  }]);

  return TaskQueue;
}();

export default TaskQueue;
