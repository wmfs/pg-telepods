'use strict'

const debug = require('debug')('telepods')
const makeDir = require('make-dir')
const path = require('path')
const processUpserts = require('./process-upserts')
const processDeletes = require('./process-deletes')
const processCopy = require('./process-copy')

async function pgTelepods (options) {
  debug('Start')
  dbgOptions(options)

  await createDirectories(options)

  debug('Finding upserts ...')
  await processUpserts(options)

  debug('Finding deletes ...')
  await processDeletes(options)

  debug('Applying changes ...')
  await processCopy(options)
  debug('Complete')
} // pgTelepods

async function createDirectories (options) {
  options.deletesDir = path.join(options.outputDir, 'deletes')
  options.upsertsDir = path.join(options.outputDir, 'upserts')

  // Make sure 'deletes' and 'upserts' directories are ready
  for (const dir of [options.deletesDir, options.upsertsDir]) {
    await makeDir(dir)
  }
} // createDirectories

function dbgOptions (options) {
  debug({
    source: options.source,
    target: options.target,
    join: options.join,
    deletesDir: options.deletesDir,
    upsertsDir: options.upsertsDir
  })
} // dbgOptions

module.exports = pgTelepods
