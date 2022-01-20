# Location Agnostic Federated Web Modules

TL;DR: this repo provides an example of how to serve modules so they don't care
where they are hosted, as in:

```js
new ModuleFederationPlugin({
    // ...
    remotes: {
        // NO SERVER NAMES!!!
        host: "host@/remoteEntry.js",
        module_a: "module_a@/container/module_a/remoteEntry.js",
    },
});
```

## Motivation

This repo serves as an example for how to host federated web components in a way
that they don't care where they are hosted either in development or production,
and documents a couple of gotcha's at frustrated me in my first attempt to use
federated modules.

_hint: search for the word "Gotcha" in this repo for gotchas that, you know, got me_

## Background

It really bothers me that in every tutorial I can find, federated modules (hosts
and remotes) need to know where they and their dependencies are hosted both in
development and production. Specifically these bits in the webpack config that
require the scheme/hostname/port of the server be specified at build time,
which prevent the use of things like testing / staging sites hosted on the web (for
true E2E testing including the infrastructure config):

```js
// webpack.config.js

const SERVER = argv.mode === "development"
            ? "http://localhost:8080/"
            : "https://myProductionServer.com/",

module.exports = (_, argv) => ({
  output: {
    publicPath: `${SERVER}`
  },

  // ...

  plugins: [
    new ModuleFederationPlugin({
      //...
      remotes: {
        header: `header@${SERVER}/remoteEntry.js`,
      },
    }),
  ],
});
```

_Ya, I could set these sever locations with, say, an environment variable, but that's another thing I could forget to do that would cause me hours of hair pulling to debug..._

## Background

I have this hammer in my tool belt (nginx) and I saw a nail (hosting federated modules in a way that they don't need to know where they're hosted)

## Strategy

-   Start the react (webpack) dev server listing on served at port 3300.
-   Build the federated remote modules (e.g. `module_a/`) so it's assets are in
    the dist directory (e.g. `module_a/dist`).
-   Use nginx (listening on port 3100) and:
    -   proxy the web application.
    -   proxy the modules by serving request like `/container/module_a/remoteEntry.js`
        from `module_a/dist/remoteEntry.js`

## Outline of this example

-   `host/` is a react app which depends on a remote module (`module_a/Work`) and
    exposes is't own module (`host/Register`)
-   `module_a/` is a simple js that exposes a module (`module_a/Work`) module that imports
    `host/Register`
-   `dev-nginx.conf` is an NGINX config file that supports live reloading of the
    host app and proxies any number of (remote) federated modules located in the
    root directory (this could easily be changed to a typical path in the like
    `/packages` used in monorepos)

## Usage

Terminal 1: Start the usual react dev server

```sh
cd host-agnostic-fm-example/host
yarn
yarn start
```

(close the window that automatically opens on port 3300 by the react dev server)

Terminal 2: build the federated module

```sh
cd host-agnostic-fm-example/module_a
npm run build
```

Terminal 3: Start the NGINX proxy (running in docker -- yes, you'll need docker installed for this...)

```sh
cd host-agnostic-fm-example
docker run \
    --rm -it \
    -p 3100:80 \
    -v $PWD/dev-nginx.conf:/etc/nginx/nginx.conf \
    -v $PWD:/www/containers \
    nginx
```

Finally, open the app on `localhost:3100` (where the NGINX proxy is listening)

# Serve the "prod" (static) app

Step 1: build everything

```sh
cd host-agnostic-fm-example
pushd host
yarn build
popd
pushd module_a
yarn build
popd
```

Step 2: Serve the static app

```sh
cd host-agnostic-fm-example
docker run \
    --rm -it \
    -p 3100:80 \
    -v $PWD/prod-nginx.conf:/etc/nginx/nginx.conf \
    -v $PWD:/www/containers \
    -v $PWD/host/build:/www/data \
    nginx
```

The app is now running on port 3100

Explanation of the above in brief (this isn't a valid bash script)

```sh
docker run \ # docker should run something
    --rm \ # and clean up after it quits
    -it \ # and stream outputs to the console and listen for control-C to quit
    -p 3100:80 \ # and expose the app on localhost:3100
    -v $PWD/prod-nginx.conf:/etc/nginx/nginx.conf \ # and use the "prod" config
    -v $PWD:/www/containers \ # and map this repo to /www/containers
    -v $PWD/host/build:/www/data \ # and map the static host app to /www/data
    nginx # and use the standard NGINX docker image
```

## Limitations

-   The host app still needs to know that it is the host. E.G. there must be
    exactly one component served at `/remoteEntry.js` and every other component is
    served at `/container/module_name/remoteEntry.js`
