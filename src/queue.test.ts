import queue, { Status, readQueue } from './queue'

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
            status: Status.queued, crc32: "b3b4b1"
        }
    ]
    queue.next(state)
    readQueue(queue)
        .subscribe({
            next: queue => expect(queue).toBe(state),
            complete: () => done(),
        }) 
})
