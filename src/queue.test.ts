import queue, { incomingQueue, Status, readQueue, pendingQueueSize, outgoingQueue } from './queue'

test('read queue empty state', done => {
    readQueue(queue)
        .subscribe({
            next: queue => expect(queue).toStrictEqual([]),
            complete: () => done(),
        })
})

test('read queue state', done => {
    const state = [
        {
            status: Status.queued, crc32: "35458902"
        }
    ]
    queue.next(state)
    readQueue(queue)
        .subscribe({
            next: queue => expect(queue).toBe(state),
            complete: () => done(),
        })
})

test('pending queue size equals 1', done => {
    pendingQueueSize(queue)
        .subscribe({
            next: queue => expect(queue).toStrictEqual(1),
            complete: () => done(),
        })
})

test('incoming item appends to queue state', done => {
    const nextItem = {
        status: Status.queued, crc32: "59120d9e"
    }

    const state = [
        {
            status: Status.queued, crc32: "35458902"
        },
        nextItem
    ]
    incomingQueue.next(nextItem)
    readQueue(queue)
        .subscribe({
            next: queue => expect(queue).toStrictEqual(state),
            complete: () => done(),
        })
})

test('incoming item appends to queue state without payload', done => {
    const nextItem = {
        status: Status.queued, crc32: "5b3b8331"
    }

    const state = [
        {
            status: Status.queued, crc32: "35458902"
        },
        {
            status: Status.queued, crc32: "59120d9e"
        },
        nextItem
    ]
    incomingQueue.next({ status: nextItem.status, crc32: nextItem.crc32, payload: "blahblah" })
    readQueue(queue)
        .subscribe({
            next: queue => expect(queue).toStrictEqual(state),
            complete: () => done(),
        }) 
})

test('incoming item routed to outgoing with payload', done => {
    const nextItem = {
        status: Status.queued, crc32: "76eb50af", payload: "testing123"
    }
    outgoingQueue.subscribe({
        next: queue => {
            expect(queue).toStrictEqual(nextItem)
            done()
        }
    })

    incomingQueue.next(nextItem)
})

test('update incoming to complete', done => {
    const nextItem = {
        status: Status.complete, crc32: "76eb50af"
    }

    const state = [
        {
            status: Status.queued, crc32: "35458902"
        },
        {
            status: Status.queued, crc32: "59120d9e"
        },
        {
            status: Status.queued, crc32: "5b3b8331"
        },
        nextItem
    ]
    incomingQueue.next(nextItem)
    readQueue(queue)
        .subscribe({
            next: queue => expect(queue).toStrictEqual(state),
            complete: () => done(),
        }) 
})

test('pending queue size equals 3', done => {
    pendingQueueSize(queue)
        .subscribe({
            next: queue => expect(queue).toStrictEqual(3),
            complete: () => done(),
        })
})

test('update incoming to error', done => {
    const nextItem = {
        status: Status.error, crc32: "5b3b8331"
    }

    const state = [
        {
            status: Status.queued, crc32: "35458902"
        },
        {
            status: Status.queued, crc32: "59120d9e"
        },
        nextItem,
        {
            status: Status.complete, crc32: "76eb50af"
        }
    ]
    incomingQueue.next(nextItem)
    readQueue(queue)
        .subscribe({
            next: queue => expect(queue).toStrictEqual(state),
            complete: () => done(),
        }) 
})

test('pending queue size equals 2', done => {
    pendingQueueSize(queue)
        .subscribe({
            next: queue => expect(queue).toStrictEqual(2),
            complete: () => done(),
        })
})
