import 'dotenv/config';

interface Config {
    httpPort: number
    openAiSecret: string
    openAiThrottleTime: number
    writeInterval: number
}

const config: Config = {
    httpPort: <number | undefined>process.env['HTTP_PORT'] ?? 8080,
    openAiSecret: <string | undefined>process.env['OPENAI_SECRET'] ?? '',
    openAiThrottleTime: <number | undefined>process.env['OPENAI_THROTTLE'] ?? 200, // 200ms = 5 requests per second
    writeInterval: <number | undefined>process.env['DB_WRITE_INTERVAL'] ?? 5000, // 1 per 5 seconds
}

export default config
