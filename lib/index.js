'use strict'

const debug = require('debug')('telepods')
const makeDir = require('make-dir')
const path = require('path')
const processInserts = require('./process-inserts')
const processUpserts = require('./process-upserts')
const processConflicts = require('./process-conflicts')
const processDeletes = require('./process-deletes')
const processCopy = require('./process-copy')

async function pgTelepods (options) {
  debug('Start')
  dbgOptions(options)

  await createDirectories(options)

  debug('Finding inserts ...')
  await processInserts(options)

  debug('Finding updates ...')
  await processUpserts(options)

  debug('Finding deletes ...')
  await processDeletes(options)

  if (options.target.where) {
    debug('Finding conflicts ...')
    await processConflicts(options)
  }

  debug('Applying changes ...')
  await processCopy(options)
  debug('Complete')
} // pgTelepods

async function createDirectories (options) {
  options.insertsDir = path.join(options.outputDir, 'inserts')
  options.deletesDir = path.join(options.outputDir, 'deletes')
  options.upsertsDir = path.join(options.outputDir, 'upserts')

  const dirs = [options.deletesDir, options.upsertsDir, options.insertsDir]

  if (options.target.where) {
    options.conflicts = path.join(options.outputDir, 'conflicts')
    dirs.push(options.conflicts)
  }

  for (const dir of dirs) {
    await makeDir(dir)
  }
} // createDirectories

function dbgOptions (options) {
  debug({
    source: options.source,
    target: options.target,
    join: options.join,
    deletesDir: options.deletesDir,
    upsertsDir: options.upsertsDir,
    insertsDir: options.insertsDir,
  })
} // dbgOptions

module.exports = pgTelepods
