
function whereClause (filter, tableName = null, inverted = false) {
  if (!filter) {
    return '1=1'
  }

  const table = tableName ? `${tableName}.` : ''
  const filterExpressions = Object.keys(filter)
    .map(field => fieldExpression(table, field, filter[field], inverted))

  const where = filterExpressions.join(' AND ')

  return where
} // generateWhereClause

function fieldExpression (table, field, filterObj, inverted) {
  const filters = Object.keys(filterObj)
  const exprs = filters
    .map(cmp => filterExpression(table, field, cmp, filterObj[cmp], inverted))
  const expression = exprs.join(!inverted ? ' AND ' : ' OR ')

  return (filters.length == 1)
    ? expression
    : `(${expression})`
} // fieldExpression

function filterExpression (table, field, cmp, value, inverted) {
  if (Array.isArray(value)) {
    const orExprs = value.map(v => filterExpression(table, field, cmp, v, inverted))
    return `(${orExprs.join(!inverted ? ' OR ' : ' AND ')})`
  }

  const fullFieldName = `${table}${field}`
  const comparator = comparatorLookup(cmp, inverted)
  const escapedValue = sqlEscape(value)
  const notNull = notNullQualifier(fullFieldName, cmp, value, inverted)

  const expression = `${fullFieldName}${comparator}${escapedValue}`

  return (inverted && notNull)
    ? `(${expression}${notNull})`
    : expression
} // filterExpression

function notNullQualifier (fullFieldName, comparator, value, inverted) {
  if (comparator !== 'equals' || typeof value !== 'string') return null

  return !inverted ? ` and ${fullFieldName} is not null` : ` or ${fullFieldName} is null`
}

const Comparators = {
  equals: ' = ',
  moreThan: ' > ',
  lessThan: ' < ',
  moreThanEquals: ' >= ',
  lessThanEquals: ' <= '
}

const InvertedComparators = {
  equals: ' != ',
  moreThan: ' <= ',
  lessThan: ' >= ',
  moreThanEquals: ' < ',
  lessThanEquals: ' > '
}

function comparatorLookup (cmp, inverted) {
  const comparator = !inverted ? Comparators[cmp] : InvertedComparators[cmp]

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
