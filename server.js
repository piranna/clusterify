#!/usr/bin/env node

const cluster = require('cluster')


const workers = parseInt(process.env.WORKERS)
             || require('os').cpus().length


// Worker, or single CPU
if(cluster.isWorker || workers === 1)
{
  // Remove clusterify script so worker is left as if it was executed directly
  process.argv.splice(1, 1)

  require(require('path').resolve(process.argv[1]))
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
