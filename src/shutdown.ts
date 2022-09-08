import { Subject, delay } from 'rxjs'

const shutdown = new Subject<string>()

shutdown.pipe(delay(2000)).subscribe((_) => {
    process.exit(0)
})

process.on('SIGTERM', () => shutdown.next('SIGTERM'))
process.on('SIGINT', () => shutdown.next('SIGINT'))
process.on('uncaughtException', () => shutdown.next('uncaughtException'))

export default shutdown
