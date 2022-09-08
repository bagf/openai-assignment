import { BehaviorSubject, Subject, Observable, take, map } from 'rxjs'
import winston from './winston'

export enum Status {
    queued = 'queued', complete = 'complete', error = 'error'
}

export interface QueuedItem {
    status: Status
    crc32: string,
    payload?: string
}

const logger = winston('queue')
const queue = new BehaviorSubject<Array<QueuedItem>>([])
export const incomingQueue = new Subject<QueuedItem>
export const outgoingQueue = new Subject<QueuedItem>

queue.subscribe((queue: Array<QueuedItem>) => {
    const queued = queue.filter(item => item.status == Status.queued).length
    const error = queue.filter(item => item.status == Status.error).length
    const complete = queue.filter(item => item.status == Status.complete).length
    logger.info(`Stats [queued/complete/error] ${queued}/${complete}/${error}`)
})

incomingQueue.subscribe(item => {
    readQueue(queue).subscribe(queueState => {
        if (item.status == Status.complete || item.status == Status.error) {
            // Update existing item in state
            logger.info(`Updated ${item.crc32}`)
            queue.next(queueState.map(
                (stateItem) => (stateItem.crc32 == item.crc32 ? item : stateItem)
            ))
        } else if (queueState.filter(stateItem => stateItem.crc32 === item.crc32).length == 0) {
            // Create new item in state
            logger.info(`Added ${item.crc32}`)
            outgoingQueue.next(item)
            const { status, crc32 } = item // Remove payload from queue
            queue.next([ ...queueState, { status, crc32 } ])
        }
    })
})

export function readQueue(queue: Observable<Array<QueuedItem>>): Observable<Array<QueuedItem>> {
    return queue.pipe(take(1))
}

export function pendingQueueSize(queue: Observable<Array<QueuedItem>>): Observable<number> {
    return queue.pipe(take(1), map(state => state.filter(item => item.status == Status.queued).length))
}

export default queue
