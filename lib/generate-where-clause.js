
function generateWhereClause (filter, tableName = null) {
  if (!filter) {
    return '1=1'
  }

  const table = tableName ? `${tableName}.` : ''
  const filterExpressions = Object.keys(filter)
    .map(field => fieldExpression(table, field, filter[field]))

  return `${filterExpressions.join(' AND ')}`
} // generateWhereClause

function fieldExpression (table, field, filterObj) {
  const exprs = Object.keys(filterObj)
    .map(cmp => filterExpression(table, field, cmp, filterObj[cmp]))
  return exprs.join(' AND ')
} // fieldExpression

function filterExpression (table, field, cmp, value) {
  if (Array.isArray(value)) {
    const orExprs = value.map(v => filterExpression(table, field, cmp, v))
    return `(${orExprs.join(' OR ')})`
  }

  const fullFieldName = `${table}${field}`
  const comparator = comparatorLookup(cmp)
  const escapedValue = sqlEscape(value)

  return `${fullFieldName}${comparator}${escapedValue}`
} // filterExpression

const Comparators = {
  equals: ' = ',
  moreThan: ' > ',
  lessThan: ' < ',
  moreThanEquals: ' >= ',
  lessThanEquals: ' <= '
}

function comparatorLookup (cmp) {
  const comparator = Comparators[cmp]

  if (!comparator) throw new Error(`${cmp} is an unknown comparison in the where filter object`)

  return comparator
} // comparatorLookup

// sadly, we can't use SQL parameters with the pg-copy-streams,
// so we have to put the value into the generated SQL
function sqlEscape (value) {
  const type = typeof value
  switch (type) {
    case 'boolean':
    case 'number':
      return value.toString()
    case 'string':
      return sqlEscapeString(value)
    default:
      throw new Error('Can not escape object into SQL string')
  }
} // sqlEscape

function sqlEscapeString (value) {
  const backslash = value.indexOf('\\') !== -1
  const prefix = backslash ? 'E' : ''
  value = value.replace(/'/g, "''")
  value = value.replace(/\\/g, '\\\\')
  return `${prefix}'${value}'`
} // sqlEscapeString

module.exports = generateWhereClause
