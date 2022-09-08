import express, { Application, Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import responseTime from 'response-time'
import { Logger } from 'winston'
import winston from './winston'
import queue, { readQueue } from './queue'
import config from './config'

const httpLoggerMiddleware = (logger: Logger) => responseTime((req: Request, res: Response, time: number) => {
    const log = `${Math.ceil(time)}ms ${req.method} ${req.url} ${res.statusCode}`
    logger.info(log)
})

const logger = winston('app')
logger.info(`Starting service`)
const app: Application = express()
app.use(httpLoggerMiddleware(winston('http')))

app.get('/queue', (req: Request, res: Response) => {
    readQueue(queue).subscribe(queue => res.send({ queue }))
})

app.listen(config.httpPort, function () {
    logger.info(`HTTP traffic on port ${config.httpPort}`)
})
