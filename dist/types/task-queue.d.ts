declare type PlainObject<Value = any> = Record<string | number | symbol, Value>;
export declare type TaskHandler<Task extends PlainObject> = (task: Task) => any;
export declare type TaskQueueOptions<Task> = {
    indexName?: keyof Task;
    shiftOnProcess?: boolean;
};
export default class TaskQueue<Task extends PlainObject = PlainObject> {
    taskHandler: TaskHandler<Task>;
    indexName: keyof Task;
    shiftOnProcess: boolean;
    tasks: Task[];
    indexes: PlainObject<number>;
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
    constructor(taskHandler: TaskHandler<Task>, taskQueueOptions?: TaskQueueOptions<Task>);
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
    add(tasks: Task | Task[], processImmediately?: boolean): Task | Task[];
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
     * @desc Clear all currently queued tasks.
     *
     * @example
     * queue.clear()
     */
    clear(): void;
    /**
     * @private
     * @desc Add item(s) to queue.
     *
     * @param tasks - Loop over passed tasks abd add each to queue.
     */
    _addTasks(tasks: Task[]): Task[];
    /**
     * @private
     * @desc Add item to queue. Small wrapper around push that first checks
     *   if task is a duplicate.
     *
     * @param task - A single task item. Can contain any desired properties.
     */
    _addTask(task: Task): Task;
    /**
     * @private
     * @desc Check if task is a duplicate. By default it checks against a map of
     *   index. Override if duplicate check requires additional logic.
     *
     * @param task - A single task item.
     */
    _isDuplicate(task: Task): boolean;
    /**
     * @private
     * @desc Push task object to tail of tasks list and add to indexes map.
     *
     * @param task - A single task item.
     */
    _push(task: Task): void;
    /**
     * @private
     * @desc Remove and return the task at the head of the tasks list. Also removes
     *   task from indexes map.
     */
    _shift(): Task | undefined;
}
export {};
