const insertUpdate = require('./insert-update')
const generateWhereClause = require('./generate-where-clause')

function conflictCondition (
  sourceHashCol,
  targetHashCol,
  options
) {
  const targetPk = Object.values(options.join)
  const pkIsNotNull = targetPk.map(k => `target.${k} is not null`).join(' and ')

  const filter = generateWhereClause.inverted(options.target.where, 'target')

  return `(${pkIsNotNull}) and (target.${targetHashCol} is null or source.${sourceHashCol} != target.${targetHashCol}) and ${filter}`
}

function processConflicts (options) {
  if (!options.conflicts) return

  return insertUpdate(
    options,
    options.conflicts,
    conflictCondition
  )
}

module.exports = processConflicts
