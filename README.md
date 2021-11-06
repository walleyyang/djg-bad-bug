# DJG Bad Bug

## Development

You will need to create a `.env` file to connect to the correct website. See `.envexample`.

Run `npm install` to install node modules.

Run `npm run dev` to start locally.

## Docker Build

You can also build the Docker image. For example, run `docker build . -t datjuanitagurl/djg-bad-bug` to build the image. Then run `docker run --env-file ./.env datjuanitagurl/djg-bad-bug:latest` to run it. You need to use `http://host.docker.internal:<port>` to access your local machine's localhost from within the container if you are testing a website on your local machine's localhost.
