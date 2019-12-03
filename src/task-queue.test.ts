'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import TaskQueue, { TaskQueueStatus } from './task-queue'

/* -----------------------------------------------------------------------------
 * helpers
 * -------------------------------------------------------------------------- */

const waitUntilQueueStatus = (queue: TaskQueue, status: TaskQueueStatus) =>
  new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (queue.status === status) {
        clearInterval(interval)
        resolve()
      }
    }, 0)
  })

const createDeferred = <ValueType = any>() => {
  let resolveImmediately = false
  let retValue: ValueType

  const resolve = (val: ValueType) => {
    resolveImmediately = true
    retValue = val
  }

  const methods = { resolve }
  const deferred: any = new Promise<ValueType>(res => {
    methods.resolve = res
    if (resolveImmediately) {
      res(retValue)
    }
  })

  return Object.assign(deferred, methods)
}

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe('task-queue', function() {
  test('Should add task to head of queue.', () => {
    const queue = new TaskQueue(() => null)
    const task = { val: 1 }
    queue.add(task)

    expect(queue.tasks[0]).toBe(task)
  })

  test('Should return true if queue is empty.', () => {
    const queue = new TaskQueue(() => null)
    expect(queue.isEmpty()).toBe(true)
  })

  test('Should return false if queue contains tasks.', () => {
    const queue = new TaskQueue(() => null)
    queue.add({ val: 1 })

    expect(queue.isEmpty()).toBe(false)
  })

  test('Should immediately process from head of queue.', async () => {
    const processed: number[] = []
    const queue = new TaskQueue(task => processed.push(task.val))
    queue.add({ val: 1 }, true)

    await waitUntilQueueStatus(queue, TaskQueueStatus.READY)

    expect(queue.isEmpty()).toBe(true)
    expect(processed).toEqual([1])
  })

  test('Should add to queue and process after current executing task.', async () => {
    const processed: number[] = []
    const queue = new TaskQueue(task => processed.push(task.val))
    queue.add({ val: 1 }, true)
    queue.add({ val: 2 })

    await waitUntilQueueStatus(queue, TaskQueueStatus.READY)

    expect(queue.isEmpty()).toBe(true)
    expect(processed).toEqual([1, 2])
  })

  test('Should add multiple tasks to queue.', async () => {
    const processed: number[] = []
    const queue = new TaskQueue(task => processed.push(task.val))
    queue.add([{ val: 1 }, { val: 2 }], true)

    await waitUntilQueueStatus(queue, TaskQueueStatus.READY)

    expect(queue.isEmpty()).toBe(true)
    expect(processed).toEqual([1, 2])
  })

  test('Should not add duplicate entires to list.', async () => {
    const processed: number[] = []
    const queue = new TaskQueue(task => processed.push(task.val))

    queue.add(
      [
        { id: 1, val: 1 },
        { id: 1, val: 2 }
      ],
      true
    )

    await waitUntilQueueStatus(queue, TaskQueueStatus.READY)

    expect(queue.isEmpty()).toBe(true)
    expect(processed).toEqual([1])
    expect(queue.indexes).toEqual({})
  })

  test('Should stop processing after last task.', async () => {
    const processed: number[] = []
    const queue = new TaskQueue(task => processed.push(task.val))
    queue.add({ val: 1 }, true)

    await waitUntilQueueStatus(queue, TaskQueueStatus.READY)
    queue.add({ val: 2 })
    await waitUntilQueueStatus(queue, TaskQueueStatus.READY)

    expect(queue.isEmpty()).toBe(false)
    expect(processed).toEqual([1])
  })

  test('Should clear queue and indexes.', () => {
    const queue = new TaskQueue(() => null)
    queue.add([
      { id: 1, val: 1 },
      { id: 2, val: 2 }
    ])
    queue.clear()

    expect(queue.isEmpty()).toBe(true)
    expect(queue.tasks).toEqual([])
    expect(queue.indexes).toEqual({})
  })

  test('Should clear on process when flag set.', () => {
    const queue = new TaskQueue(() => null)
    queue.shiftOnProcess = true
    queue.add({ val: 1 }, true)

    expect(queue.tasks).toEqual([])
  })

  test('Should not process a paused queue until resumed.', async () => {
    const processed: number[] = []
    const queue = new TaskQueue(task => processed.push(task.val))

    queue.add([{ val: 1 }, { val: 2 }])

    queue.pause()
    queue.resume()

    await waitUntilQueueStatus(queue, TaskQueueStatus.READY)

    expect(queue.isEmpty()).toBe(false)
    expect(processed).toEqual([])

    queue.pause()
    queue.process()

    await waitUntilQueueStatus(queue, TaskQueueStatus.PAUSED_PENDING)

    expect(queue.isEmpty()).toBe(false)
    expect(processed).toEqual([])

    queue.resume()

    await waitUntilQueueStatus(queue, TaskQueueStatus.READY)

    expect(queue.isEmpty()).toBe(true)
    expect(processed).toEqual([1, 2])
  })

  test('Should continue processing queue (last task completed).', async () => {
    const processed: number[] = []
    const queue = new TaskQueue(task => processed.push(task.val))

    queue.add([{ val: 1 }, { val: 2 }], true)
    queue.pause()

    await waitUntilQueueStatus(queue, TaskQueueStatus.PAUSED_PENDING)

    expect(queue.isEmpty()).toBe(false)
    expect(processed).toEqual([1])

    queue.resume()

    await waitUntilQueueStatus(queue, TaskQueueStatus.READY)

    expect(queue.isEmpty()).toBe(true)
    expect(processed).toEqual([1, 2])
  })

  test('Should continue processing queue (last task incomplete).', async () => {
    const processed: number[] = []
    const queue = new TaskQueue(task =>
      task.then((val: number) => processed.push(val))
    )

    const tasks = [createDeferred(), createDeferred()]

    queue.add(tasks, true)
    queue.pause()

    await waitUntilQueueStatus(queue, TaskQueueStatus.PAUSED_PROCESSING)

    expect(queue.isEmpty()).toBe(false)
    expect(processed).toEqual([])

    queue.resume()
    tasks[0].resolve(1)
    tasks[1].resolve(2)

    await waitUntilQueueStatus(queue, TaskQueueStatus.READY)

    expect(queue.isEmpty()).toBe(true)
    expect(processed).toEqual([1, 2])
  })
})
