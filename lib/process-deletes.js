'use strict'
const debug = require('debug')('telepods')
const path = require('path')
const getFilename = require('./get-filename')
const pgcopy = require('pg-copy-streams').to
const fs = require('fs')
const promisify = require('util').promisify
const generateWhereClause = require('./generate-where-clause')

const NOW = '$now'
const COLUMN_NAME = /^[a-z_][a-z0-9_]*$/

module.exports = promisify(processDeletes)

// Rows in the target (within target.where) that are no longer in the source.
//
// By default they are written to deletes/ and hard-deleted when the changes are applied.
// If target.softDelete is set, e.g. { removed_at: '$now', origin_hash_sum: null }, they are
// written to updates/ instead, so the rows are kept and only those columns are set.
// Rows that already carry the soft delete values are skipped, so repeat runs don't rewrite them.
function processDeletes (options, callback) {
  const softDelete = options.target.softDelete

  let filepath, querySql
  try {
    if (softDelete) {
      filepath = path.join(options.updatesDir, getFilename(options.target.tableName))
      querySql = softDeleteSql(options)
    } else {
      filepath = path.join(options.deletesDir, getFilename(options.target.tableName))
      querySql = deleteSql(options)
    }
  } catch (err) {
    return callback(err)
  }

  debug(querySql)

  const sql = `copy (${querySql}) ` +
    'to stdout with csv delimiter \',\' header encoding \'UTF8\';'

  const output = fs.createWriteStream(filepath)
  const pipeToOutput = (sql, params, client) => {
    output.on('error', callback)
    output.on('close', callback)

    const queryStream = client.query(pgcopy(sql))

    queryStream.pipe(output)

    queryStream.on('error', callback)
  }

  options.client.run([
    { sql, action: pipeToOutput }
  ])
}

function missingKeysSql (options) {
  const sourcePk = Object.keys(options.join).join(', ')
  const targetPk = Object.values(options.join).join(', ')

  return `select ${targetPk} from ${options.target.tableName} ` +
    `where ${generateWhereClause(options.target.where)}` +
    '  except ' +
    `  select ${sourcePk} from ${options.source.tableName} `
}

function deleteSql (options) {
  return missingKeysSql(options)
}

function softDeleteSql (options) {
  const softDelete = validateSoftDelete(options.target.softDelete)
  const targetPkColumns = Object.values(options.join)
  const runTimestamp = options.runTimestamp

  // primary key columns are prefixed with '.' so supercopy treats them as the key of the update
  const pkColumns = targetPkColumns.map(column => `${column} as ".${column}"`)
  const valueColumns = Object.entries(softDelete)
    .map(([column, value]) => `${sqlValue(value, runTimestamp)} as ${column}`)

  const alreadySoftDeleted = Object.entries(softDelete)
    .map(([column, value]) => alreadySetCondition(column, value))
    .join(' and ')

  return `select ${[...pkColumns, ...valueColumns].join(', ')} ` +
    `from ${options.target.tableName} ` +
    `where (${targetPkColumns.join(', ')}) in (${missingKeysSql(options)}) ` +
    `and not (${alreadySoftDeleted})`
}

function validateSoftDelete (softDelete) {
  if (typeof softDelete !== 'object' || Array.isArray(softDelete) || Object.keys(softDelete).length === 0) {
    throw new Error('target.softDelete must be an object of column names to values')
  }

  for (const [column, value] of Object.entries(softDelete)) {
    if (!COLUMN_NAME.test(column)) {
      throw new Error(`target.softDelete: '${column}' is not a valid column name`)
    }
    if (value !== null && !['string', 'number', 'boolean'].includes(typeof value)) {
      throw new Error(`target.softDelete: value for '${column}' must be null, a string, a number, a boolean or '${NOW}'`)
    }
  }

  return softDelete
}

function sqlValue (value, runTimestamp) {
  if (value === null) return 'null'
  if (value === NOW) return generateWhereClause.sqlEscape(runTimestamp)
  return generateWhereClause.sqlEscape(value)
}

// '$now' columns count as already set when they hold any timestamp,
// so a row keeps the time it was first soft deleted
function alreadySetCondition (column, value) {
  if (value === NOW) return `${column} is not null`
  if (value === null) return `${column} is null`
  return `${column} is not distinct from ${generateWhereClause.sqlEscape(value)}`
}
