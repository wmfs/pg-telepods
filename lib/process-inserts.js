const insertsUpdates = require('./insert-update')

function insertCondition (
  sourceHashColumnName,
  targetHashColumnName,
  options
) {
  const targetPk = Object.values(options.join)
  const pkIsNull = targetPk.map(k => `target.${k} is null`).join(' and ')

  return pkIsNull
}

function processInserts (options) {
  return insertsUpdates(
    options,
    options.insertsDir,
    insertCondition
  )
}

module.exports = processInserts
