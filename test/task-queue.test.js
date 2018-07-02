'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

import TaskQueue from '../src/task-queue'

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe('task-queue.js', function () {
  let processed
  let queue

  beforeEach(function () {
    processed = []

    queue = new TaskQueue((task, next) => {
      processed.push(task.val)
      setTimeout(next, 0)
    })
  })

  test('Should add task to head of queue.', function () {
    var task = { val: 1 }
    queue.add(task)

    expect(queue.tasks[0]).toBe(task)
  })

  test('Should return true if queue is empty.', function () {
    expect(queue.isEmpty()).toBe(true)
  })

  test('Should return false if queue contains tasks.', function () {
    queue.add({ val: 1 })
    expect(queue.isEmpty()).toBe(false)
  })

  test('Should immediately process from head of queue.', function (done) {
    const assertState = () => {
      expect(queue.isEmpty()).toBe(true)
      expect(processed).toEqual([1])
      done()
    }

    queue.add({ val: 1 }, true)
    setTimeout(assertState, 100)
  })

  test('Should add to queue and process after current executing task.', function (done) {
    const assertState = () => {
      expect(queue.isEmpty()).toBe(true)
      expect(processed).toEqual([1, 2])
      done()
    }

    queue.add({ val: 1 }, true)
    queue.add({ val: 2 })

    setTimeout(assertState, 100)
  })

  test('Should add multiple tasks to queue.', function (done) {
    const assertState = () => {
      expect(queue.isEmpty()).toBe(true)
      expect(processed).toEqual([1, 2])
      done()
    }

    queue.add([{ val: 1 }, { val: 2 }], true)
    setTimeout(assertState, 100)
  })

  test('Should not add duplicate entires to list.', function (done) {
    const assertState = () => {
      expect(queue.isEmpty()).toBe(true)
      expect(processed).toEqual([1])
      expect(queue.indexes).toEqual({})
      done()
    }

    queue.add([{ id: 1, val: 1 }, { id: 1, val: 2 }], true)
    setTimeout(assertState, 100)
  })

  test('Should stop processing after last task.', function (done) {
    const addTask = () => queue.add({ val: 2 })
    const assertState = () => {
      expect(queue.isEmpty()).toBe(false)
      expect(processed).toEqual([1])
      done()
    }

    queue.add({ val: 1 }, true)

    setTimeout(addTask, 100)
    setTimeout(assertState, 100)
  })

  test('Should clear queue and indexes.', function () {
    queue.add([{ id: 1, val: 1 }, { id: 2, val: 2 }])
    queue.clear()

    expect(queue.isEmpty()).toBe(true)
    expect(queue.tasks).toEqual([])
    expect(queue.indexes).toEqual({})
  })

  test('Should clear on process when flag set.', function () {
    queue.shiftOnProcess = true
    queue.add({ val: 1 }, true)

    expect(queue.tasks).toEqual([])
  })
})
