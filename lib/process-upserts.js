const insertUpdate = require('./insert-update')

function updateCondition (
  sourceHashColumnName,
  targetHashColumnName
) {
  return `(target.${targetHashColumnName} is not null and source.${sourceHashColumnName} != target.${targetHashColumnName})`
}

function processUpserts (options) {
  return insertUpdate(
    options,
    options.upsertsDir,
    updateCondition
  )
}

module.exports = processUpserts
