import express, { Application, Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import responseTime from 'response-time'
import { Logger } from 'winston'
import winston from './winston'
import queue, { readQueue, incomingQueue, pendingQueueSize, Status } from './queue'
import config from './config'
import memoryDatabase, { entryOrNull, readMemoryDatabase } from './persistance'
import { str as crc32 } from 'crc-32'
import openai from './openai'
import shutdown from './shutdown'

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

app.post('/queue', bodyParser.text(), (req: Request, res: Response) => {
    const checksumHex = (crc32(req.body, 0) >>> 0).toString(16)
    // Query persistence for existing response
    entryOrNull(memoryDatabase, checksumHex).subscribe(result => {
        if (result) {
            logger.info(JSON.stringify(result.openAIResponse.choices))
            res.send({
                status: 'exists',
                id: checksumHex,
                generatedTitle: result.generatedTitle,
            })
        } else {
            incomingQueue.next({ status: Status.queued, crc32: checksumHex, payload: req.body })
            pendingQueueSize(queue).subscribe(queueSize => res.send({
                status: 'queued',
                id: checksumHex,
                queueSize
            }))
        }
    })
})

openai
readMemoryDatabase(memoryDatabase)

app.listen(config.httpPort, function () {
    logger.info(`HTTP traffic on port ${config.httpPort}`)
})

shutdown.subscribe((_) => {
    logger.info('Shutting down')
    app.removeAllListeners()
    openai.unsubscribe()
})
