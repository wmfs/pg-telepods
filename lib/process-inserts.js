const insertsUpdates = require('./insert-update')

function insertCondition (
  sourceHashColumnName,
  targetHashColumnName
) {
  return `target.${targetHashColumnName} is null`
}

function processInserts (options) {
  return insertsUpdates(
    options,
    options.insertsDir,
    insertCondition
  )
}

module.exports = processInserts
