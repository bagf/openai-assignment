import express, { Application, Request, Response, NextFunction } from 'express'
import { take } from 'rxjs'
import { Logger } from 'winston'
import winston from './winston'
import queue from './queue'
import config from './config'

const httpLoggerMiddleware = (logger: Logger) => (req: Request, res: Response, next: NextFunction) => {
    const log = `${req.method} ${req.url} ${res.statusCode}`
    logger.info(log)
    next()
}

const logger = winston('app')
logger.info(`Starting service`)
const app: Application = express()
app.use(httpLoggerMiddleware(winston('http')))

app.get('/queue', (req: Request, res: Response) => {
    queue.pipe(take(1)).subscribe(queue => res.send({ queue }))
})

app.listen(config.httpPort, function () {
    logger.info(`HTTP traffic on port ${config.httpPort}`)
})
