'use strict'

const debug = require('debug')('telepods')
const QueryStream = require('pg-query-stream')
const UpsertTransformer = require('./Upsert-transformer')
const fs = require('fs')
const path = require('path')
const getFilename = require('./get-filename')

const promisify = require('util').promisify

module.exports = promisify(insertsUpdates)

function insertsUpdates (options, directory, conditionFn, callback) {
  const filePath = path.join(directory, getFilename(options.target.tableName))

  const sourceHashColumnName = options.source.hashSumColumnName
  const targetHashColumnName = options.target.hashSumColumnName
  const joinCondition = Object.entries(options.join)
    .map(([sourceColumnName, targetColumnName]) => `source.${sourceColumnName} = target.${targetColumnName}`)

  const sql = `select source.*, target.${targetHashColumnName} _target_hash_sum from ${options.source.tableName} source ` +
    `left outer join ${options.target.tableName} target on (${joinCondition.join(' AND ')}) ` +
    `where (${conditionFn(sourceHashColumnName, targetHashColumnName, options)})`

  debug(sql)

  const output = fs.createWriteStream(filePath)
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
    { sql, action: upsertTransform }
  ])
}
