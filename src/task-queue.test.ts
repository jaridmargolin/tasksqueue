'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import waitFor from 'p-wait-for'
import defer from 'p-defer'
import delay from 'delay'

// lib
import TaskQueue, { TaskQueueStatus } from './task-queue'

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe('task-queue', function () {
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
    queue.add({ val: 1 })

    await waitFor(() => queue.status === TaskQueueStatus.WAITING)

    expect(queue.isEmpty()).toBe(true)
    expect(processed).toEqual([1])
  })

  test('Should add to queue and process after current executing task.', async () => {
    const processed: number[] = []
    const queue = new TaskQueue(task => processed.push(task.val))
    queue.add({ val: 1 })
    queue.add({ val: 2 })

    await waitFor(() => queue.status === TaskQueueStatus.WAITING)

    expect(queue.isEmpty()).toBe(true)
    expect(processed).toEqual([1, 2])
  })

  test('Should add multiple tasks to queue.', async () => {
    const processed: number[] = []
    const queue = new TaskQueue(task => processed.push(task.val))
    queue.add([{ val: 1 }, { val: 2 }])

    await waitFor(() => queue.status === TaskQueueStatus.WAITING)

    expect(queue.isEmpty()).toBe(true)
    expect(processed).toEqual([1, 2])
  })

  test('Should not add duplicate entires to list.', async () => {
    const processed: number[] = []
    const queue = new TaskQueue(task => processed.push(task.val))

    queue.add([
      { id: 1, val: 1 },
      { id: 1, val: 2 }
    ])

    await waitFor(() => queue.status === TaskQueueStatus.WAITING)

    expect(queue.isEmpty()).toBe(true)
    expect(processed).toEqual([1])
    expect(queue.indexes).toEqual({})
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
    const queue = new TaskQueue(() => null, { shiftOnProcess: true })
    queue.add({ val: 1 })

    expect(queue.tasks).toEqual([])
  })

  test('Should not process a paused queue until resumed.', async () => {
    const processed: number[] = []
    const queue = new TaskQueue(task => processed.push(task.val))

    queue.pause()
    queue.add([{ val: 1 }, { val: 2 }])

    await waitFor(() => queue.status === TaskQueueStatus.PAUSED)
    await delay(10)

    expect(queue.isEmpty()).toBe(false)
    expect(processed).toEqual([])

    queue.resume()

    await waitFor(() => queue.status === TaskQueueStatus.WAITING)

    expect(queue.isEmpty()).toBe(true)
    expect(processed).toEqual([1, 2])
  })

  test('Should continue processing queue (last task completed).', async () => {
    const processed: number[] = []
    const queue = new TaskQueue(task => processed.push(task.val))

    queue.add([{ val: 1 }, { val: 2 }])
    queue.pause()

    await waitFor(() => queue.status === TaskQueueStatus.PAUSED)
    await delay(10)

    expect(queue.isEmpty()).toBe(false)
    expect(processed).toEqual([1])

    queue.resume()

    await waitFor(() => queue.status === TaskQueueStatus.WAITING)

    expect(queue.isEmpty()).toBe(true)
    expect(processed).toEqual([1, 2])
  })

  test('Should continue processing queue (last task incomplete).', async () => {
    const processed: number[] = []
    const queue = new TaskQueue(task =>
      task.promise.then((val: number) => processed.push(val))
    )

    const tasks = [defer(), defer()]

    queue.add(tasks)
    queue.pause()

    await waitFor(() => queue.status === TaskQueueStatus.PAUSED_PROCESSING)

    expect(queue.isEmpty()).toBe(false)
    expect(processed).toEqual([])

    queue.resume()
    tasks[0].resolve(1)
    tasks[1].resolve(2)

    await waitFor(() => queue.status === TaskQueueStatus.WAITING)

    expect(queue.isEmpty()).toBe(true)
    expect(processed).toEqual([1, 2])
  })
})
