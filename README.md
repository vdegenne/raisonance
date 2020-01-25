# typescript-fullstack-project-starter

This package includes the following technos :

- compilation: `typescript`, `rollup`
- server: `pm2`, `es-dev-server`, `koa`
- front: `lit-element`, `@material` elements

## Filesystem

Explanations coming soon.

## Installation/Initialisation

- Installation
  - [x] Clone this repository
    ```bash
    git clone --depth 1 https://github.com/vdegenne/typescript-fullstack-project-starter
    mv typescript-fullstack-project-starter my-app
    cd my-app
    rm -rf .git
    ```
  - [x] Install the deps `npm i`
  - [x] Install `pm2` and `es-dev-server` globally.

- Pre-configuration
  - [x] Update the server options under `src/server/options.ts`
  - [x] Watch for file changes (required to run the server) `npm run watch`
  - [x] Modify the pm2 name in `pm2.config.js`
  - [x] Start the server `pm2 start pm2.config.js`

- Development
  - [x] Watch for file changes `npm run watch`
  - [ ] Add middlewares/routes in `src/server/es-dev-server.config.ts`
  - [ ] Modify back-end and front-end sources under `src`. Everytime a `.ts` file is changed `rollup` will recompile, and the server restart.
  - [ ] Visit `http://localhost:<port>` to see the initial state of your app.

- Further
  - [ ] Delete this `README.md` and replace with the one of your project.
