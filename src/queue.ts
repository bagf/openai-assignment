import { BehaviorSubject, Observable, take } from 'rxjs'
import winston from './winston'

export enum Status {
    queued = 'queued', complete = 'complete', error = 'error'
}

export interface QueuedItem {
    status: Status
    crc32: String,
    openAiResponse?: String
}

const logger = winston('queue')
const queue = new BehaviorSubject<Array<QueuedItem>>([])

queue.subscribe((queue: Array<QueuedItem>) => {
    const queued = queue.filter(item => item.status == Status.queued).length
    const error = queue.filter(item => item.status == Status.error).length
    const complete = queue.filter(item => item.status == Status.complete).length
    logger.info(`Stats [queued/complete/error] ${queued}/${complete}/${error}`)
})

export function readQueue(queue: Observable<Array<QueuedItem>>): Observable<Array<QueuedItem>> {
    return queue.pipe(take(1))
}

export default queue
