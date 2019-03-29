# clusterify
Command-line utility to `cluster` a process

This repo offer a `clusterify` command that allow to exec any Node.js script in
a [cluster](https://nodejs.org/api/cluster.html). Take in account that due to
how `cluster` module works (and in last instance, how Node.js itself works), it
dispatch several processes without sharing state, so be sure your process don't
have a global state (*stateless*), or this is managed by an external resource,
like a database.

This module is partially inspired by https://www.npmjs.com/package/clusterify,
but providing a simpler and cleaner code, and featuring workers respawning when
any of them accidentally dies.

## Install

```sh
npm install --save @piranna/clusterify
```

## Usage

```sh
clusterify <your script> <your script arguments>
```

The best way is to configure the `start` script in your `package.json` file:

```json
{
  "start": "NODE_ENV=production clusterify ./server.js"
}
```

When executing `npm start`, it will automatically create a cluster from your
`server.js` script with a worker process for each one of your available CPUs. If
you want to run it with a single process (for example, for testing purposses),
you can be able to exec directly your `server.js` script or define the `WORKERS`
environment variable to the number of worker processes you want.

## Future work

- [ ] Provide some logging mechanism for crashed and exited processes (bunyan?)
