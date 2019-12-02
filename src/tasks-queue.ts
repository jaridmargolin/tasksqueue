'use strict'

/* -----------------------------------------------------------------------------
 * helpers
 * -------------------------------------------------------------------------- */

type PlainObject<Value = any> = Record<string | number | symbol, Value>

/* -----------------------------------------------------------------------------
 * TasksQueue
 * -------------------------------------------------------------------------- */

export type TaskHandler<Task extends PlainObject> = (task: Task) => any
export type TasksQueueOptions<Task> = {
  indexName?: keyof Task
  shiftOnProcess?: boolean
}

export default class TasksQueue<Task extends PlainObject = PlainObject> {
  taskHandler: TaskHandler<Task>
  indexName: keyof Task
  shiftOnProcess: boolean

  tasks: Task[]
  indexes: PlainObject<number>

  /**
   * @desc Extensible async task queue.
   *
   * @example
   * const queue = new TasksQueue((task, next) => {
   *   task.fn(task.opts, next)
   * })
   *
   * @param taskHandler - Function called when task is processed.
   * @param taskQueueOptions - TasksQueue configuration options.
   */
  constructor (
    taskHandler: TaskHandler<Task>,
    taskQueueOptions: TasksQueueOptions<Task> = {}
  ) {
    const { indexName = 'id', shiftOnProcess = false } = taskQueueOptions

    this.taskHandler = taskHandler
    this.indexName = indexName
    this.shiftOnProcess = shiftOnProcess

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
    const task = this.shiftOnProcess ? this._shift() : this.tasks[0]

    if (typeof task !== 'undefined') {
      Promise.resolve(this.taskHandler(task)).then(() => {
        !this.shiftOnProcess && this._shift()
        this.process()
      })
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
      delete this.indexes[this.tasks[i][this.indexName]]
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
    return this.indexes.hasOwnProperty(task[this.indexName])
  }

  /**
   * @private
   * @desc Push task object to tail of tasks list and add to indexes map.
   *
   * @param task - A single task item.
   */
  _push (task: Task) {
    const indexVal = this.tasks.push(task) - 1

    if (task.hasOwnProperty(this.indexName)) {
      this.indexes[task[this.indexName]] = indexVal
    }
  }

  /**
   * @private
   * @desc Remove and return the task at the head of the tasks list. Also removes
   *   task from indexes map.
   */
  _shift () {
    const task = this.tasks.shift()
    task && delete this.indexes[task[this.indexName]]

    return task
  }
}
