#!/usr/bin/env node

const cluster = require('cluster')


const workers = parseInt(process.env.WORKERS)
             || require('os').cpus().length


// Worker, or single CPU
if(cluster.isWorker || workers === 1)
{
  const [script] = process.argv.splice(2, 1)

  process.argv[1] = script  // Set worker script as if it was executed directly

  require(require('path').resolve(script))
}

// Master
else
{
  for(let i = 0; i < workers; i++) cluster.fork()

  cluster.on('exit', function(worker/*, code, signal*/)
  {
    // Re-spawn the worker only if it died accidentally
    if(!worker.exitedAfterDisconnect) cluster.fork()
  })
}
