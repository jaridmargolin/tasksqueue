declare type PlainObject<Value = any> = Record<string | number | symbol, Value>;
export declare type TaskHandler<Task extends PlainObject> = (task: Task) => any;
export interface TaskQueueSettings<Task> {
    /** Key used to index tasks within queue. */
    indexKey: keyof Task;
    /** Flag to determine if processing tasks will be removed from queue eagerly. */
    shiftOnProcess: boolean;
}
export declare enum TaskQueueStatus {
    /** Wairing for tasks to process. */
    WAITING = 0,
    /** Actively processing queue. */
    PROCESSING = 1,
    /** Processing paused. */
    PAUSED = 2,
    /** Paused with an async task still being proessed. */
    PAUSED_PROCESSING = 3
}
export default class TaskQueue<Task extends PlainObject = PlainObject> {
    status: TaskQueueStatus;
    tasks: Task[];
    indexes: PlainObject<number>;
    private _handler;
    private _settings;
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
    constructor(taskHandler: TaskHandler<Task>, taskQueueSettings?: Partial<TaskQueueSettings<Task>>);
    /**
     * @desc Add item(s) to queue. Optionally being processing queue.
     *
     * @example
     * queue.add({ 'id': 1, args: arguments }, true)
     *
     * @param tasks - An array or single task to add to queue.
     */
    add(tasks: Task | Task[]): Task | Task[];
    /**
     * @desc Check to determine if queue is empty. Queue is considered empty
     *   if the tasks array has a length of 0.
     *
     * @example
     * queue.isEmpty()
     */
    isEmpty(): boolean;
    /**
     * @desc Proccess task found at the head of the queue.
     *
     * @example
     * queue.process()
     */
    process(): void;
    /**
     * @desc Pauses a queue. If the queue was processing, the queue will halt
     * moving to the next task. The current task will continue executing.
     *
     * @example
     * queue.pause()
     */
    pause(): void;
    /**
     * @desc Resumes a paused queue. If queue was paused while processing, it
     * will continue to process.
     *
     * @example
     * queue.resume()
     */
    resume(): void;
    /**
     * @desc Clear all currently queued tasks.
     *
     * @example
     * queue.clear()
     */
    clear(): void;
    /**
     * @desc Add item(s) to queue.
     *
     * @param tasks - Loop over passed tasks abd add each to queue.
     */
    private _addTasks;
    /**
     * @desc Add item to queue. Small wrapper around push that first checks
     *   if task is a duplicate.
     *
     * @param task - A single task item. Can contain any desired properties.
     */
    private _addTask;
    /**
     * @desc Check if task is a duplicate. By default it checks against a map of
     *   index. Override if duplicate check requires additional logic.
     *
     * @param task - A single task item.
     */
    private _isDuplicate;
    /**
     * @desc Push task object to tail of tasks list and add to indexes map.
     *
     * @param task - A single task item.
     */
    private _push;
    /**
     * @desc Remove and return the task at the head of the tasks list. Also removes
     *   task from indexes map.
     */
    private _shift;
    /**
     * @desc Continue to next task
     */
    private _next;
}
export {};
