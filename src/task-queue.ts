'use strict'

/* -----------------------------------------------------------------------------
 * helpers
 * -------------------------------------------------------------------------- */

type PlainObject<Value = any> = Record<string | number | symbol, Value>

/* -----------------------------------------------------------------------------
 * TaskQueue
 * -------------------------------------------------------------------------- */

export type TaskHandler<Task extends PlainObject> = (task: Task) => any

export interface TaskQueueSettings<Task> {
  /** Key used to index tasks within queue. */
  indexKey: keyof Task
  /** Flag to determine if processing tasks will be removed from queue eagerly. */
  shiftOnProcess: boolean
}

export enum TaskQueueStatus {
  /** Wairing for tasks to process. */
  WAITING,
  /** Actively processing queue. */
  PROCESSING,
  /** Processing paused. */
  PAUSED,
  /** Paused with an async task still being proessed. */
  PAUSED_PROCESSING
}

export default class TaskQueue<Task extends PlainObject = PlainObject> {
  status: TaskQueueStatus = TaskQueueStatus.WAITING
  tasks: Task[] = []
  indexes: PlainObject<number> = {}

  private _handler: TaskHandler<Task>
  private _settings: TaskQueueSettings<Task> = {
    indexKey: 'id',
    shiftOnProcess: false
  }

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
  constructor (
    taskHandler: TaskHandler<Task>,
    taskQueueSettings: Partial<TaskQueueSettings<Task>> = {}
  ) {
    this._handler = taskHandler
    Object.assign(this._settings, taskQueueSettings)
  }

  /**
   * @desc Add item(s) to queue. Optionally being processing queue.
   *
   * @example
   * queue.add({ 'id': 1, args: arguments }, true)
   *
   * @param tasks - An array or single task to add to queue.
   */
  add (tasks: Task | Task[]) {
    const isEmpty = this.isEmpty()
    const result = Array.isArray(tasks)
      ? this._addTasks(tasks)
      : this._addTask(tasks)

    if (isEmpty) {
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
    if (this.status === TaskQueueStatus.WAITING) {
      const task = this._settings.shiftOnProcess ? this._shift() : this.tasks[0]

      if (typeof task !== 'undefined') {
        this.status = TaskQueueStatus.PROCESSING
        Promise.resolve(this._handler(task)).then(() => this._next())
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
  pause () {
    this.status =
      this.status === TaskQueueStatus.PROCESSING
        ? TaskQueueStatus.PAUSED_PROCESSING
        : TaskQueueStatus.PAUSED
  }

  /**
   * @desc Resumes a paused queue. If queue was paused while processing, it
   * will continue to process.
   *
   * @example
   * queue.resume()
   */
  resume () {
    if (this.status === TaskQueueStatus.PAUSED) {
      this.status = TaskQueueStatus.WAITING
      this.process()
    } else if (this.status === TaskQueueStatus.PAUSED_PROCESSING) {
      this.status = TaskQueueStatus.PROCESSING
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
      delete this.indexes[this.tasks[i][this._settings.indexKey]]
    }

    this.tasks.length = 0
  }

  /* ---------------------------------------------------------------------------
   * internal/helpers
   * ------------------------------------------------------------------------ */

  /**
   * @desc Add item(s) to queue.
   *
   * @param tasks - Loop over passed tasks abd add each to queue.
   */
  private _addTasks (tasks: Task[]) {
    const added = []
    for (var i = 0, l = tasks.length; i < l; i++) {
      added.push(this._addTask(tasks[i]))
    }

    return added
  }

  /**
   * @desc Add item to queue. Small wrapper around push that first checks
   *   if task is a duplicate.
   *
   * @param task - A single task item. Can contain any desired properties.
   */
  private _addTask (task: Task) {
    if (!this._isDuplicate(task)) {
      this._push(task)
    }

    return task
  }

  /**
   * @desc Check if task is a duplicate. By default it checks against a map of
   *   index. Override if duplicate check requires additional logic.
   *
   * @param task - A single task item.
   */
  private _isDuplicate (task: Task) {
    return this.indexes.hasOwnProperty(task[this._settings.indexKey])
  }

  /**
   * @desc Push task object to tail of tasks list and add to indexes map.
   *
   * @param task - A single task item.
   */
  private _push (task: Task) {
    const indexVal = this.tasks.push(task) - 1

    if (task.hasOwnProperty(this._settings.indexKey)) {
      this.indexes[task[this._settings.indexKey]] = indexVal
    }
  }

  /**
   * @desc Remove and return the task at the head of the tasks list. Also removes
   *   task from indexes map.
   */
  private _shift () {
    const task = this.tasks.shift()
    task && delete this.indexes[task[this._settings.indexKey]]

    return task
  }

  /**
   * @desc Continue to next task
   */
  private _next () {
    !this._settings.shiftOnProcess && this._shift()

    if (this.status === TaskQueueStatus.PROCESSING) {
      this.status = TaskQueueStatus.WAITING
      this.process()
    } else if (this.status === TaskQueueStatus.PAUSED_PROCESSING) {
      this.status = TaskQueueStatus.PAUSED
    }
  }
}
