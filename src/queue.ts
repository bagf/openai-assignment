import { BehaviorSubject, map } from 'rxjs'
import winston from './winston'

enum Status {
    queued = 'queued', complete = 'complete', error = 'error'
}

interface QueuedItem {
    status: Status
    crc32: String,
    openAiResponse?: String
}

const logger = winston('queue')
const subject = new BehaviorSubject<Array<QueuedItem>>([
    {
        status: Status.queued, crc32: "b3b4b1"
    }
]);

subject.subscribe((queue: Array<QueuedItem>) => {
    const queued = queue.filter(item => item.status == Status.queued).length
    const error = queue.filter(item => item.status == Status.error).length
    const complete = queue.filter(item => item.status == Status.complete).length
    logger.info(`Stats [queued/complete/error] ${queued}/${complete}/${error}`)
})

export default subject
