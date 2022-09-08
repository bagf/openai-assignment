import { BehaviorSubject, Observable, take, map, Subject, buffer, interval, filter } from 'rxjs'
import winston from './winston'
import config from './config'
import shutdown from './shutdown'
import fs, { write } from 'fs'
import os from 'os'
import {parse, stringify} from 'flatted'

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
const persistenceFile = `${os.tmpdir}/persistence.json`

const memoryWriteSub = writeDatabase.subscribe((unwrittenEntry) => {
    const promise = new Promise<Map<string, DatabaseEntry>>(resolve => {
        memoryDatabase.subscribe(state => resolve(state))
    })

    promise.then((state) => {
        const updatedDb = new Map(state)
        updatedDb.set(unwrittenEntry.id, unwrittenEntry)
        memoryDatabase.next(updatedDb)
    })
})

const writeSub = writeDatabase.pipe(buffer(writeNotification), filter(u => u.length > 0), map(unwritten => {
    logger.info(`Writing ${unwritten.length} entries to ${persistenceFile}`)
    memoryDatabase.subscribe(db => {
        try {
            fs.writeFileSync(persistenceFile, stringify(Array.from(db.values())) , 'utf-8')
        } catch (ex) {
            logger.error(`Failed to write ${persistenceFile}`, ex)
        }
    })
}))
    .subscribe((_) => {})

shutdown.subscribe((_) => {
    writeNotification.next('write')
    intervalSubscription.unsubscribe()
    memoryWriteSub.unsubscribe()
    setTimeout(() => writeSub.unsubscribe(), 500)
})


export function entryOrNull(memoryDatabase: Observable<Map<string, DatabaseEntry>>, id: string): Observable<DatabaseEntry | null> {
    return memoryDatabase.pipe(take(1), map(x => x.get(id) ?? null))
}

export function readMemoryDatabase(memoryDatabase: Subject<Map<string, DatabaseEntry>>): void {
    try {
        const json = fs.readFileSync(persistenceFile)
        const database = parse(json.toString('utf-8')) as Array<DatabaseEntry>
        const db = new Map<string, DatabaseEntry>()
        logger.info(`Reading ${database.length} entries from ${persistenceFile}`)
        database.map(dbItem => {
            db.set(dbItem.id, dbItem)
        })
        memoryDatabase.next(db)
    } catch (ex) {
        logger.error(`Failed to read ${persistenceFile}`, ex)
    }
}

export default memoryDatabase
