import { BehaviorSubject, Observable, take, map, filter, throttleTime } from 'rxjs'
import { Configuration, OpenAIApi } from 'openai'
import winston from './winston'
import { outgoingQueue, Status, incomingQueue } from './queue'
import config from './config'
import { writeDatabase } from './persistance'

const logger = winston('openai')
const configuration = new Configuration({
    apiKey: config.openAiSecret,
  })
  const openai = new OpenAIApi(configuration)

const stream = outgoingQueue.pipe(
    filter(item => item.status == Status.queued && !!item.payload),
    throttleTime(config.openAiThrottleTime))

logger.info(`Subscribing to queue ${config.openAiSecret}`)

const sub = stream.subscribe(async ({ payload, crc32 }) => {
    logger.info('Sending createCompletion request')
    await openai.createCompletion({
        model: 'text-davinci-002', 
        prompt: `Give me a video title\n\n${payload}`,
        temperature: 0,
        max_tokens: 64,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
    }).then(completetion => {
        const result = ((completetion.data.choices ?? [])[0].text)?.replace("\n", '')
        logger.info(`Response for createCompletion: ${result}`)
        writeDatabase.next({
            id: crc32,
            openAIRequest: completetion.request,
            openAIResponse: completetion.data,
            generatedTitle: result,
        })
        incomingQueue.next({ crc32, status: Status.complete })
    }).catch(error => {
        logger.error(error)
        incomingQueue.next({ crc32, status: Status.error })
    })
})

export default sub
