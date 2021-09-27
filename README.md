# Bad Bug

## Development

You will need to create a `.env` file to connect to the correct website. See `.envexample`.

Run `npm install` to install node modules.

Run `npm start` to start locally.

This uses the `prettier` formatter.

## Docker Build

You can also build the Docker image. For example, run `docker build . -t datjuanitagurl/bad-bug` to build the image. Then run `docker run --env-file ./.env datjuanitagurl/bad-bug:latest` to run it. You need to use `http://host.docker.internal:<port>` to access your local machine's localhost from within the container if you are testing a website on your local machine's localhost.
