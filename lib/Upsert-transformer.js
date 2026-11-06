'use strict'

const Transform = require('stream').Transform
const _ = require('lodash')
const csvStringify = require('csv-string').stringify

class UpsertTransformer extends Transform {
  constructor (options) {
    super({ objectMode: true })
    this.sourceHashSumColumn = options.source.hashSumColumnName
    this.targetHashSumColumn = options.target.hashSumColumnName
    this.targetTablePkColumnNames = _.values(options.join)
    this.notWrittenHeaderYet = true
    this.transformFunction = options.transformFunction
    this.columnProperties = []
    this.headerColumns = []
  }

  processFirstLine (firstTransformedLine) {
    const _this = this

    _.keys(firstTransformedLine).forEach(
      function (columnProperty) {
        let columnName = _.snakeCase(columnProperty)
        if (_this.targetTablePkColumnNames.indexOf(columnName) !== -1) {
          columnName = '.' + columnName
        }
        _this.headerColumns.push(columnName)
        if (columnName === _this.targetHashSumColumn) {
          _this.columnProperties.push(columnName)
        } else {
          _this.columnProperties.push(columnProperty)
        }
      }
    )

    return csvStringify(this.headerColumns)
  }

  _transform (sourceRow, encoding, callback) {
    const _this = this

    // camelCase the column names (e.g. address_line_1 -> addressLine1, _created -> created).
    // lodash gives the same results as camelcase-keys 7 did; camelcase-keys 8+ is ESM-only
    // and 10 keeps leading underscores (_created), which would change the output.
    sourceRow = _.mapKeys(sourceRow, (value, key) => key === '_target_hash_sum' ? key : _.camelCase(key))

    this.transformFunction(sourceRow, function (err, transformedRow) {
      if (err) {
        callback(err)
      } else {
        transformedRow[_this.targetHashSumColumn] = sourceRow[_.camelCase(_this.sourceHashSumColumn)]
        let csvLine
        if (_this.notWrittenHeaderYet) {
          csvLine = _this.processFirstLine(transformedRow)
          _this.notWrittenHeaderYet = false
        } else {
          csvLine = ''
        }

        const csvParts = []
        _this.columnProperties.forEach(
          function (columnProperty) {
            csvParts.push(transformedRow[columnProperty])
          }
        )

        callback(null, csvLine + csvStringify(csvParts))
      }
    })
  }
}

module.exports = UpsertTransformer
