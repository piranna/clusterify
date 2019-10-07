#!/usr/bin/env node

const cluster = require('cluster')


let numWorkers = parseInt(process.env.CLUSTERIFY_WORKERS)
              || require('os').cpus().length


// Worker, or single CPU
if(cluster.isWorker || numWorkers === 1)
{
  // Remove clusterify script so worker is left as if it was executed directly
  process.argv.splice(1, 1)

  require(require('path').resolve(process.argv[1]))
}

// Master
else
{
  const timeout = parseInt(process.env.CLUSTERIFY_TIMEOUT) || 5000

  const reSpawnedWorkers = new Set()
  const deleteSpawnedWorker = reSpawnedWorkers.delete.bind(reSpawnedWorkers)

  function spawnWorkers()
  {
    // Re-spawn the process and the previous died ones, and activate their
    // watchdogs
    for(let i = Object.keys(cluster.workers).length; i < numWorkers; i++)
    {
      const {id} = cluster.fork()

      setTimeout(deleteSpawnedWorker, timeout, id)

      reSpawnedWorkers.add(id)
    }
  }

  spawnWorkers()

  cluster.on('exit', function(worker, code, signal)
  {
    // Worker exited on purposse, do nothing
    if(worker.exitedAfterDisconnect) return numWorkers && numWorkers--

    if(!reSpawnedWorkers.has(worker.id)) return spawnWorkers()

    // Set the exit code of master process to the exit code of the first
    // failed re-spawned worker process
    if(!process.exitCode) process.exitCode = code || signal

    // TODO check and decide what to do if workers die with different exit
    // codes between them
  })
}
