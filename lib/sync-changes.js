const supercopy = require('@wmfs/supercopy')

function syncChanges (options) {
  const tableNameParts = options.target.tableName.split('.')
  return supercopy(
    {
      sourceDir: options.outputDir,
      headerColumnNamePkPrefix: '.',
      topDownTableOrder: [tableNameParts[1]],
      client: options.client,
      schemaName: tableNameParts[0],
      debug: false
    }
  )
}

module.exports = syncChanges
