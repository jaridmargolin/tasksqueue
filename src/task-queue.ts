'use strict'

/* -----------------------------------------------------------------------------
 * helpers
 * -------------------------------------------------------------------------- */

type PlainObject<Value = any> = Record<string | number | symbol, Value>

/* -----------------------------------------------------------------------------
 * TaskQueue
 * -------------------------------------------------------------------------- */

export type TaskHandler<Task extends PlainObject> = (task: Task) => any

export type TaskQueueOptions<Task> = {
  /** Key used to index tasks within queue. */
  indexKey?: keyof Task
  /** Flag to determine if processing tasks will be removed from queue eagerly. */
  shiftOnProcess?: boolean
}

export enum TaskQueueStatus {
  /** Ready to begin processing queue. */
  READY,
  /** Actively processing queue. */
  PROCESSING,
  /** Paused while in READY state. */
  PAUSED_READY,
  /** Paused while processing queue. */
  PAUSED_PROCESSING,
  /** Paused with an immediate process call pending. */
  PAUSED_PENDING
}

export default class TaskQueue<Task extends PlainObject = PlainObject> {
  status: TaskQueueStatus
  tasks: Task[]
  indexes: PlainObject<number>

  /** @private */
  _taskHandler: TaskHandler<Task>

  /** @private */
  _indexKey: keyof Task

  /** @private */
  _shiftOnProcess: boolean

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
  constructor (
    taskHandler: TaskHandler<Task>,
    taskQueueOptions: TaskQueueOptions<Task> = {}
  ) {
    const { indexKey = 'id', shiftOnProcess = false } = taskQueueOptions

    this._taskHandler = taskHandler
    this._indexKey = indexKey
    this._shiftOnProcess = shiftOnProcess

    this.status = TaskQueueStatus.READY
    this.tasks = []
    this.indexes = {}
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
  add (tasks: Task | Task[], processImmediately?: boolean) {
    const isEmpty = this.isEmpty()
    const result = Array.isArray(tasks)
      ? this._addTasks(tasks)
      : this._addTask(tasks)

    if (isEmpty && processImmediately) {
      this.process()
    }

    return result
  }

  /**
   * @desc Check to determine if queue is empty. Queue is considered empty
   *   if the tasks array has a length of 0.
   *
   * @example
   * queue.isEmpty()
   */
  isEmpty () {
    return !this.tasks.length
  }

  /**
   * @desc Proccess task found at the head of the queue.
   *
   * @example
   * queue.process()
   */
  process () {
    if (
      this.status === TaskQueueStatus.READY ||
      this.status === TaskQueueStatus.PROCESSING
    ) {
      const task = this._shiftOnProcess ? this._shift() : this.tasks[0]

      if (typeof task === 'undefined') {
        this.status = TaskQueueStatus.READY
      } else {
        this.status = TaskQueueStatus.PROCESSING
        Promise.resolve(this._taskHandler(task)).then(() => this._next())
      }
    } else if (this.status === TaskQueueStatus.PAUSED_READY) {
      this.status = TaskQueueStatus.PAUSED_PENDING
    }
  }

  /**
   * @desc Pauses a queue. If the queue was processing, the queue will halt
   * moving to the next task. The current task will continue executing.
   *
   * @example
   * queue.pause()
   */
  pause () {
    if (this.status === TaskQueueStatus.PROCESSING) {
      this.status = TaskQueueStatus.PAUSED_PROCESSING
    } else if (this.status === TaskQueueStatus.READY) {
      this.status = TaskQueueStatus.PAUSED_READY
    }
  }

  /**
   * @desc Resumes a paused queue. If queue was paused while processing, it
   * will continue to process.
   *
   * @example
   * queue.resume()
   */
  resume () {
    if (this.status === TaskQueueStatus.PAUSED_PENDING) {
      this.status = TaskQueueStatus.PROCESSING
      this.process()
    } else if (this.status === TaskQueueStatus.PAUSED_PROCESSING) {
      this.status = TaskQueueStatus.PROCESSING
    } else if (this.status === TaskQueueStatus.PAUSED_READY) {
      this.status = TaskQueueStatus.READY
    }
  }

  /**
   * @desc Clear all currently queued tasks.
   *
   * @example
   * queue.clear()
   */
  clear () {
    for (var i = 0, l = this.tasks.length; i < l; i++) {
      delete this.indexes[this.tasks[i][this._indexKey]]
    }

    this.tasks.length = 0
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
  _addTasks (tasks: Task[]) {
    const added = []
    for (var i = 0, l = tasks.length; i < l; i++) {
      added.push(this._addTask(tasks[i]))
    }

    return added
  }

  /**
   * @private
   * @desc Add item to queue. Small wrapper around push that first checks
   *   if task is a duplicate.
   *
   * @param task - A single task item. Can contain any desired properties.
   */
  _addTask (task: Task) {
    if (!this._isDuplicate(task)) {
      this._push(task)
    }

    return task
  }

  /**
   * @private
   * @desc Check if task is a duplicate. By default it checks against a map of
   *   index. Override if duplicate check requires additional logic.
   *
   * @param task - A single task item.
   */
  _isDuplicate (task: Task) {
    return this.indexes.hasOwnProperty(task[this._indexKey])
  }

  /**
   * @private
   * @desc Push task object to tail of tasks list and add to indexes map.
   *
   * @param task - A single task item.
   */
  _push (task: Task) {
    const indexVal = this.tasks.push(task) - 1

    if (task.hasOwnProperty(this._indexKey)) {
      this.indexes[task[this._indexKey]] = indexVal
    }
  }

  /**
   * @private
   * @desc Remove and return the task at the head of the tasks list. Also removes
   *   task from indexes map.
   */
  _shift () {
    const task = this.tasks.shift()
    task && delete this.indexes[task[this._indexKey]]

    return task
  }

  /**
   * @private
   * @desc Continue to next task
   */
  _next () {
    !this._shiftOnProcess && this._shift()

    if (this.status === TaskQueueStatus.PROCESSING) {
      this.process()
    } else {
      this.status = TaskQueueStatus.PAUSED_PENDING
    }
  }
}
