# Transcript summary title Microservice

This project uses NodeJS v14 and requires a OpenAI API key. Steps on how to use the project described below:

### 1) Install dependencies, if you do not have yarn installed run `npm install -g yarn`

```sh
nvm use
yarn install
```
### 2) Copy sample env and configure environment variables.

```sh
cp .env.sample .env
```
Edit `.env` and change `OPENAPI_SECRET` to your own API key.

### 3) Run tests
```sh
yarn test
```

### 4) Run microservice
```sh
yarn dev
```

### API

In this projects current release, there are two API endpoints exposed:

#### Query Queue

Will list all queued transcripts. Statuses are:

-   `queued` - Pending submission to OpenAI
-   `complete` - Submission to OpenAI successful
-   `error` - Error occured during submission to OpenAI

```
GET /queue
{
	"queue": [
		{
			"status": "queued",
			"crc32": "35458902"
		}
	]
}
```

#### Post Transcript

Submit transcript text to be processed, will respond with a unique ID string which can be referenced as the CRC32 hash in the queue. For convience, the queue size after being submitted is also returned.

```
POST /queue
{
	"status": "queued",
	"id": "b5f1cc4",
	"queueSize": 1
}
```

Submitting and stored transcript will return a status of `exists` as well as the generated title text.

```
POST /queue
{
	"status": "exists",
	"id": "35458902",
	"generatedTitle": "Hello world"
}
```

## Outstanding tasks

-	[ ] Create Dockerfile and Kuberenetes manifests
-	[ ] Github actions automated tests CI
-	[ ] Lint codebase and improve inline documentation
-	[ ] Integration tests for the API routes
-	[ ] Unit tests the persistence functionality
-	[ ] Mock OpenAI calls and test request throttling functionality
-	[ ] Make persistence configurable and use a database connector other than local file system
-	[ ] Add a write/read lock for the persistence.json file
-	[ ] Make persistence.ts async when writing to filesystem
-   [ ] Tweak OpenAI implementation to come up with less verbose titles