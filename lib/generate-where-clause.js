
function whereClause (filter, tableName = null, inverted = false) {
  if (!filter) {
    return '1=1'
  }

  const table = tableName ? `${tableName}.` : ''
  const filterExpressions = Object.keys(filter)
    .map(field => fieldExpression(table, field, filter[field], inverted))

  const where = filterExpressions.join(' AND ')

  return inverted ? `not(${where})` : where
} // generateWhereClause

function fieldExpression (table, field, filterObj, inverted) {
  const exprs = Object.keys(filterObj)
    .map(cmp => filterExpression(table, field, cmp, filterObj[cmp], inverted))
  return exprs.join(' AND ')
} // fieldExpression

function filterExpression (table, field, cmp, value, inverted) {
  if (Array.isArray(value)) {
    const orExprs = value.map(v => filterExpression(table, field, cmp, v, inverted))
    return `(${orExprs.join(' OR ')})`
  }

  const fullFieldName = `${table}${field}`
  const comparator = comparatorLookup(cmp)
  const escapedValue = sqlEscape(value)
  const notNull = notNullQualifier(fullFieldName, cmp, value)

  const expression = `${fullFieldName}${comparator}${escapedValue}`

  return (inverted && notNull)
    ? `(${expression}${notNull})`
    : expression
} // filterExpression

function notNullQualifier (fullFieldName, comparator, value) {
  if (comparator !== 'equals' || typeof value !== 'string') return null

  return ` and ${fullFieldName} is not null`
}

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

function generateWhereClause (filter, tableName = null) {
  return whereClause(filter, tableName, false)
}
function generateNotWhereClause (filter, tableName = null) {
  return whereClause(filter, tableName, true)
}

module.exports = generateWhereClause
generateWhereClause.inverted = generateNotWhereClause
