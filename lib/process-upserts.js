const insertUpdate = require('./insert-update')
const generateWhereClause = require('./generate-where-clause')

function updateCondition (
  sourceHashCol,
  targetHashCol,
  options
) {
  const filter = generateWhereClause(options.target.where)

  return `(target.${targetHashCol} is null or source.${sourceHashCol} != target.${targetHashCol}) and ${filter}`
}

function processUpserts (options) {
  return insertUpdate(
    options,
    options.upsertsDir,
    updateCondition
  )
}

module.exports = processUpserts
