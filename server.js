#!/usr/bin/env node

const cluster = require('cluster')


let numWorkers = parseInt(process.env.CLUSTERIFY_WORKERS)
              || require('os').cpus().length


// Worker, or single CPU
if(cluster.isWorker || !numWorkers)
{
  // Remove clusterify script so worker is left as if it was executed directly
  process.argv.splice(1, 1)

  return require(require('path').resolve(process.argv[1]))
}

// Master
const timeout = parseInt(process.env.CLUSTERIFY_TIMEOUT) || 5000

const reSpawnedWorkers = new Map()
const deleteSpawnedWorker = reSpawnedWorkers.delete.bind(reSpawnedWorkers)

function spawnWorkers()
{
  // Re-spawn the process and the previous died ones, and activate their
  // watchdogs
  for(let i = Object.keys(cluster.workers).length; i < numWorkers; i++)
  {
    const {id} = cluster.fork()

    reSpawnedWorkers.set(id, setTimeout(deleteSpawnedWorker, timeout, id))
  }
}

spawnWorkers()

cluster.on('exit', function(worker, code, signal)
{
  // Worker exited on purpose, just only reduce number or workers
  if(worker.exitedAfterDisconnect) return numWorkers && numWorkers--

  const {id} = worker
  const timeout = reSpawnedWorkers.get(id)

  // Worker crashed after start timeout, re-spawn it
  if(timeout === undefined) return spawnWorkers()

  clearTimeout(timeout)
  reSpawnedWorkers.delete(id)

  // Set the exit code of master process to the exit code of the first
  // failed re-spawned worker process
  if(!process.exitCode) process.exitCode = code || signal

  // TODO check and decide what to do if workers die with different exit
  // codes between them
})
