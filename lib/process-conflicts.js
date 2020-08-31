const insertUpdate = require('./insert-update')
const generateWhereClause = require('./generate-where-clause')

function conflictCondition (
  sourceHashCol,
  targetHashCol,
  options
) {
  const filter = generateWhereClause.inverted(options.target.where, 'target')

  return `(target.${targetHashCol} is null or source.${sourceHashCol} != target.${targetHashCol}) and ${filter}`
}

function processConflicts (options) {
  return insertUpdate(
    options,
    options.conflicts,
    conflictCondition
  )
}

module.exports = processConflicts
