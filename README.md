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