const insertUpdate = require('./insert-update')
const generateWhereClause = require('./generate-where-clause')

function conflictCondition (
  sourceHashCol,
  targetHashCol,
  whereCondition
) {
  const filter = generateWhereClause(whereCondition)

  return `(source.${sourceHashCol} != target.${targetHashCol}) and not (${filter})`
}

function processConflicts (options) {
  return insertUpdate(
    options,
    options.conflicts,
    conflictCondition
  )
}

module.exports = processConflicts
