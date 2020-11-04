# Scrapng test

## Installation

1. Download the project

2. Run `npm i` to install dependencies

## Running

1. If you're using VS Code, you can use the following structure to run and compile the prject

```
{
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "program": "${workspaceFolder}/src/app.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": [
        "${workspaceFolder}/dist/**/*.js"
      ],
      "env": {
        "AFFLUENT_USERNAME": "",
        "AFFLUENT_PASSWORD": "",
        "DB_HOST": "",
        "DB_NAME": "",
        "DB_USER": "",
        "DB_PASSWORD": ""
      }
    }
```

2. If not using VS Code, you need to comple TS files by running `./node_modules/.bin/tsc --project tsconfig.json` then start the app by running `AFFLUENT_USERNAME=name AFFLUENT_PASSWORD=password DB_HOST=host DB_NAME=name DB_USER=user DB_PASSWORD=password node ./dist/app`

3. Run tests by executing `npm run test`

## API

- GET **/** will render the home page with data available in the DB
- GET **/reload** wll re-insert the data in the DB and redirect to the home page