import 'dotenv/config';

interface Config {
    httpPort: number
    openAiKey: string
    openAiSecret: string
}

const config: Config = {
    httpPort: <number | undefined>process.env['HTTP_PORT'] ?? 8080,
    openAiKey: <string | undefined>process.env['OPENAI_KEY'] ?? '',
    openAiSecret: <string | undefined>process.env['OPENAI_SECRET'] ?? '',
}

export default config
