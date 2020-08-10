const insertUpdate = require('./insert-update')
const generateWhereClause = require('./generate-where-clause')

function conflictCondition (
  sourceHashCol,
  targetHashCol,
  options
) {
  const filter = generateWhereClause(options.target.where)

  return `(target.${targetHashCol} is null or source.${sourceHashCol} != target.${targetHashCol}) and not (${filter})`
}

function processConflicts (options) {
  return insertUpdate(
    options,
    options.conflicts,
    conflictCondition
  )
}

module.exports = processConflicts
