import { BehaviorSubject, Observable, take, map, Subject, buffer, interval } from 'rxjs'
import winston from './winston'
import config from './config'
import shutdown from './shutdown'

export interface DatabaseEntry {
    id: string,
    openAIResponse?: any
    openAIRequest?: any
    generatedTitle?: string
}

const logger = winston('persistance')
const memoryDatabase = new BehaviorSubject<Map<string, DatabaseEntry>>(new Map())
export const writeDatabase = new Subject<DatabaseEntry>()
const writeNotification = new Subject<string>()
const intervalSubscription = interval(config.writeInterval).subscribe((_) => writeNotification.next('write'))

shutdown.subscribe((_) => {
    writeNotification.next('write')
    intervalSubscription.unsubscribe()
})

writeDatabase.pipe(buffer(writeNotification), map(unwritten => {
    logger.info(`Writing ${unwritten.length} entries`)
    //@todo
}))
    .subscribe((_) => {})

export function entryOrNull(memoryDatabase: Observable<Map<string, DatabaseEntry>>, id: string): Observable<DatabaseEntry | null> {
    return memoryDatabase.pipe(take(1), map(x => x.get(id) ?? null))
}

export default memoryDatabase
