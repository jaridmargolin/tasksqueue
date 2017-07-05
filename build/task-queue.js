(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["TaskQueue"] = factory();
	else
		root["TaskQueue"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";


/* -----------------------------------------------------------------------------
 * TaskQueue
 * -------------------------------------------------------------------------- */

class TaskQueue {
  /**
   * @desc Extensible async task queue.
   *
   * @example
   * const queue = new TaskQueue((task, next) => {
   *   task.fn(task.opts, next)
   * })
   *
   * @param {Function} processFn - Function called when task is processed.
   */
  constructor(processFn) {
    this.processFn = processFn;
    this.tasks = [];
    this.indexes = {};

    // respect any values set in subclasses
    this.indexName = this.indexName || 'id';
  }

  /**
   * @desc Add item(s) to queue. Optionally being processing queue.
   *
   * @example
   * queue.add({ 'id': 1, args: arguments }, true)
   *
   * @param {Array|Object} tasks - An array or single task to add to queue.
   */
  add(tasks, processTask) {
    const isEmpty = this.isEmpty();
    const result = Array.isArray(tasks) ? this._addTasks(tasks) : this._addTask(tasks);

    if (isEmpty && processTask) {
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
  isEmpty() {
    return !this.tasks.length;
  }

  /**
   * @desc Proccess task found at the head of the queue.
   *
   * @example
   * queue.process()
   */
  process() {
    const task = this.shiftOnProcess ? this._shift() : this.tasks[0];

    this.processFn(task, () => {
      if (!this.shiftOnProcess) {
        this._shift();
      }

      return this.isEmpty() ? null : this.process();
    });
  }

  /**
   * @desc Clear all currently queued tasks.
   *
   * @example
   * queue.clear()
   */
  clear() {
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
   * @param {Array} tasks - Loop over passed tasks abd add each to queue.
   */
  _addTasks(tasks) {
    const added = [];
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
   * @param {Object} task - A single task item. Can contain any desired properties.
   */
  _addTask(task) {
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
   * @param {Object} task - A single task item.
   */
  _isDuplicate(task) {
    return this.indexes.hasOwnProperty(task[this.indexName]);
  }

  /**
   * @private
   * @desc Push task object to tail of tasks list and add to indexes map.
   *
   * @param {Object} task - A single task item.
   */
  _push(task) {
    const indexVal = this.tasks.push(task) - 1;

    if (task.hasOwnProperty(this.indexName)) {
      this.indexes[task[this.indexName]] = indexVal;
    }
  }

  /**
   * @private
   * @desc Remove and return the task at the head of the tasks list. Also removes
   *   task from indexes map.
   */
  _shift() {
    const task = this.tasks.shift();
    delete this.indexes[task[this.indexName]];

    return task;
  }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = TaskQueue;


/* harmony default export */ __webpack_exports__["a"] = (TaskQueue);

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__task_queue__ = __webpack_require__(0);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return __WEBPACK_IMPORTED_MODULE_0__task_queue__["a"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "TaskQueue", function() { return __WEBPACK_IMPORTED_MODULE_0__task_queue__["b"]; });



/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ })
/******/ ]);
});