/* eslint-env mocha */

'use strict'

const HlPgClient = require('@wmfs/hl-pg-client')
const startTelepods = require('./../lib')
const process = require('process')
const chai = require('chai')
const expect = chai.expect
const path = require('path')
const fs = require('fs')

function lineCount (outputDir, operation, filename) {
  const filePath = path.resolve(outputDir, operation, filename)
  expect(fs.existsSync(filePath), `${operation}/${filename} exists`).to.equal(true)
  return fs.readFileSync(filePath, { encoding: 'utf-8' }).split('\n').length
}

function telepodsOptions (client, outputDir, runTimestamp) {
  return {
    client,
    outputDir,
    runTimestamp,
    source: {
      tableName: 'feed.addresses',
      hashSumColumnName: 'hash_sum'
    },
    target: {
      tableName: 'registry.addresses',
      hashSumColumnName: 'origin_hash_sum',
      where: {
        data_source: { equals: 'feed' }
      },
      softDelete: {
        removed_at: '$now',
        origin_hash_sum: null
      }
    },
    join: {
      ref: 'ref',
      counter: 'counter'
    },
    transformFunction: function (sourceRow, callback) {
      callback(null, {
        ref: sourceRow.ref,
        counter: 1,
        label: sourceRow.label,
        data_source: 'feed',
        removed_at: null // a row that is back in the source is no longer removed
      })
    }
  }
}

async function addresses (client) {
  const result = await client.query(
    'select ref, origin_hash_sum, label, data_source, removed_at from registry.addresses order by ref'
  )
  return result.rows
}

describe('soft delete tests', function () {
  this.timeout(process.env.TIMEOUT || 5000)
  let client

  before(function () {
    if (process.env.PG_CONNECTION_STRING && !/^postgres:\/\/[^:]+:[^@]+@(?:localhost|127\.0\.0\.1).*$/.test(process.env.PG_CONNECTION_STRING)) {
      console.log(`Skipping tests due to unsafe PG_CONNECTION_STRING value (${process.env.PG_CONNECTION_STRING})`)
      this.skip()
    }
  })

  before('create a new pg client', () => {
    client = new HlPgClient(process.env.PG_CONNECTION_STRING)
  })

  before('install test schemas', () => {
    return client.runFile(path.resolve(__dirname, 'fixtures', 'install-soft-delete-schemas.sql'))
  })

  const firstRunDir = path.resolve(__dirname, './output', 'soft-delete-first')
  const secondRunDir = path.resolve(__dirname, './output', 'soft-delete-second')
  const thirdRunDir = path.resolve(__dirname, './output', 'soft-delete-returned')
  const firstRunAt = '2026-11-01T09:00:00.000Z'
  const secondRunAt = '2026-11-02T09:00:00.000Z'
  const thirdRunAt = '2026-11-03T09:00:00.000Z'

  describe('first run: a row missing from the source', () => {
    it('run telepods with softDelete', async () => {
      await startTelepods(telepodsOptions(client, firstRunDir, firstRunAt))
    })

    it('keeps the missing row and marks it, rather than deleting it', async () => {
      const rows = await addresses(client)
      expect(rows.length).to.equal(4)

      const [one, two, three, four] = rows
      expect(one.removed_at).to.equal(null)
      expect(two.removed_at).to.equal(null)

      expect(three.label).to.equal('3 High Street')
      expect(three.origin_hash_sum).to.equal(null)
      expect(new Date(three.removed_at).toISOString()).to.equal(firstRunAt)

      // outside target.where, so never touched
      expect(four.data_source).to.equal('local')
      expect(four.removed_at).to.equal(null)
    })

    it('writes the soft delete to updates/ (header + 1 row + trailing newline)', () => {
      expect(lineCount(firstRunDir, 'updates', 'addresses.csv')).to.equal(3)
    })

    it('writes nothing to deletes/', () => {
      expect(fs.existsSync(path.resolve(firstRunDir, 'deletes', 'addresses.csv'))).to.equal(false)
    })
  })

  describe('second run: the row is still missing', () => {
    it('run telepods with softDelete', async () => {
      await startTelepods(telepodsOptions(client, secondRunDir, secondRunAt))
    })

    it('skips the row that is already marked, keeping its original timestamp', async () => {
      const rows = await addresses(client)
      expect(new Date(rows[2].removed_at).toISOString()).to.equal(firstRunAt)
    })

    it('writes only a header to updates/', () => {
      expect(lineCount(secondRunDir, 'updates', 'addresses.csv')).to.equal(2)
    })
  })

  describe('third run: the row is back in the source', () => {
    before('put the row back in the source', () => {
      return client.query("insert into feed.addresses (hash_sum, ref, label) values ('CCCC', 3, '3 High Street')")
    })

    it('run telepods with softDelete', async () => {
      await startTelepods(telepodsOptions(client, thirdRunDir, thirdRunAt))
    })

    it('upserts the returning row and clears the mark', async () => {
      const rows = await addresses(client)
      expect(rows[2].removed_at).to.equal(null)
      expect(rows[2].origin_hash_sum).to.equal('CCCC')
    })

    it('upserts it because its hash was cleared', () => {
      expect(lineCount(thirdRunDir, 'upserts', 'addresses.csv')).to.equal(3)
    })
  })

  describe('invalid softDelete config', () => {
    it('rejects an invalid column name', async () => {
      const options = telepodsOptions(client, path.resolve(__dirname, './output', 'soft-delete-invalid'), firstRunAt)
      options.target.softDelete = { 'removed_at; drop table x': '$now' }

      let error = null
      try {
        await startTelepods(options)
      } catch (err) {
        error = err
      }
      expect(error).to.not.equal(null)
      expect(error.message).to.contain('not a valid column name')
    })
  })

  after('uninstall test schemas', () => {
    return client.runFile(path.resolve(__dirname, 'fixtures', 'uninstall-soft-delete-schemas.sql'))
  })

  after('close database connections', () => {
    client.end()
  })
})
