'use strict'

const debug = require('debug')('telepods')
const QueryStream = require('pg-query-stream')
const UpsertTransformer = require('./Upsert-transformer')
const fs = require('fs')
const path = require('path')
const getFilename = require('./get-filename')
const promisify = require('util').promisify

module.exports = promisify(processInserts)

function processInserts (options, callback) {
  const insertsFilePath = path.join(options.insertsDir, getFilename(options.target.tableName))

  const targetHashColumnName = options.target.hashSumColumnName
  const joinCondition = Object.entries(options.join)
    .map(([sourceColumnName, targetColumnName]) => `source.${sourceColumnName} = target.${targetColumnName}`)

  const sql = `select source.*, target.${targetHashColumnName} _target_hash_sum from ${options.source.tableName} source ` +
    `left outer join ${options.target.tableName} target on (${joinCondition.join(' AND ')}) ` +
    `where target.${targetHashColumnName} is null`

  debug(sql)

  const output = fs.createWriteStream(insertsFilePath)
  const upsertTransform = (sql, params, client) => {
    output.on('error', callback)
    output.on('close', callback)

    const queryStream = client.query(new QueryStream(sql))
    const upsertTransformer = new UpsertTransformer(options)

    queryStream
      .pipe(upsertTransformer)
      .pipe(output)

    queryStream.on('error', callback)

    return new Promise(resolve => {
      queryStream.on('end', resolve)
    })
  } // upsertTransform

  options.client.run([
    { sql: sql, action: upsertTransform }
  ])
}
