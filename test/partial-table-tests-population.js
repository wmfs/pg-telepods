/* eslint-env mocha */

'use strict'

const HlPgClient = require('@wmfs/hl-pg-client')
const startTelepods = require('./../lib')
const process = require('process')
const chai = require('chai')
const expect = chai.expect
const path = require('path')
const fs = require('fs')

function checkFileLength (outputDir, operation, filename, expectedLength) {
  const censusFile = path.resolve(outputDir, operation, filename)
  expect(fs.existsSync(censusFile)).to.equal(true)

  const deletes = fs.readFileSync(censusFile, { encoding: 'utf-8' })
  expect(deletes.split('\n').length).to.equal(expectedLength)
}

function fileNotExists (outputDir, operation, filename) {
  const censusDeletes = path.resolve(outputDir, operation, filename)
  expect(fs.existsSync(censusDeletes)).to.equal(false)
}

describe('partial-table population',
  function () {
    // this.timeout(process.env.TIMEOUT || 5000)
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
      return client.runFile(path.resolve(__dirname, 'fixtures', 'install-test-schemas.sql'))
    })

    before('empty census table', async () => {
      await client.query('DELETE FROM government.census')
    })

    const firstSyncOutputDir = path.resolve(__dirname, './output', 'first-partial-populate')

    describe('sync first table to populate target', () => {
      it('start the telepods', async () => {
        const result = await startTelepods({
          client: client,
          outputDir: firstSyncOutputDir,
          source: {
            tableName: 'springfield.people',
            hashSumColumnName: 'hash_sum'
          },
          target: {
            tableName: 'government.census',
            hashSumColumnName: 'origin_hash_sum',
            where: {
              town: { equals: 'Springfield' }
            }
          },
          join: {
            social_security_id: 'id_number' // key = source table column, value = target table column
          },
          transformFunction: function (sourceRow, callback) {
            callback(null, {
              id_number: sourceRow.socialSecurityId,
              name: `${sourceRow.firstName} ${sourceRow.lastName}`,
              town: 'Springfield'
            })
          }
        })
        expect(result).to.not.equal(null)
      })

      it('verify modified children rows', async () => {
        const result = await client.query(
          'select id_number, origin_hash_sum, name, town from government.census order by id_number'
        )
        expect(result).to.not.equal(null)
        expect(result.rows).to.eql(
          [
            {
              name: 'Homer Simpson',
              origin_hash_sum: 'AAAAAAAA',
              id_number: 1,
              town: 'Springfield'
            },
            {
              name: 'Marge Simpson',
              origin_hash_sum: 'BBBBBBBB',
              id_number: 2,
              town: 'Springfield'
            },
            {
              name: 'Montgomery Burns',
              origin_hash_sum: 'EEEEEEEE',
              id_number: 5,
              town: 'Springfield'
            },
            {
              name: 'Ned Flanders',
              origin_hash_sum: '11111111',
              id_number: 6,
              town: 'Springfield'
            }
          ]
        )
      })

      it('check for inserts csv', () => {
        checkFileLength(firstSyncOutputDir, 'inserts', 'census.csv', 6) // header + 4 lines + trailing cr
      })

      it('check for upserts csv', () => {
        checkFileLength(firstSyncOutputDir, 'upserts', 'census.csv', 1) // cr
      })

      it('check for deletes csv', () => {
        checkFileLength(firstSyncOutputDir, 'deletes', 'census.csv', 2) // header + cr
      })

      it('check for conflicts csv', () => {
        fileNotExists(firstSyncOutputDir, 'conflicts', 'census.csv')
      })
    })

    after('uninstall test schemas', () => {
      return client.runFile(path.resolve(__dirname, 'fixtures', 'uninstall-test-schemas.sql'))
    })

    after('close database connections', () => {
      client.end()
    })
  })
