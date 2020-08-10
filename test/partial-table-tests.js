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
  const censusDeletes = path.resolve(outputDir, operation, filename)
  expect(fs.existsSync(censusDeletes)).to.equal(true)

  const deletes = fs.readFileSync(censusDeletes, { encoding: 'utf-8' })
  expect(deletes.split('\n').length).to.equal(expectedLength)
}

describe('partial-table test',
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

    const firstSyncOutputDir = path.resolve(__dirname, './output', 'first-partial')
    const secondSyncOutputDir = path.resolve(__dirname, './output', 'second-partial')
    const thirdSyncOutputDir = path.resolve(__dirname, './output', 'partial-with-conflict')

    describe('sync first table', () => {
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
            },
            {
              name: 'Phillip Fry',
              origin_hash_sum: 'ABCDEFGH',
              id_number: 20,
              town: 'New New York'
            },
            {
              name: 'Leela',
              origin_hash_sum: 'DEFGHIJK',
              id_number: 21,
              town: 'New New York'
            },
            {
              name: 'Doctor Zoidburg',
              origin_hash_sum: 'ZZZZZZZZ',
              id_number: 38,
              town: 'New New York'
            }
          ]
        )
      })

      it('check for inserts csv', () => {
        checkFileLength(firstSyncOutputDir, 'inserts', 'census.csv', 4)
      })

      it('check for upserts csv', () => {
        checkFileLength(firstSyncOutputDir, 'upserts', 'census.csv', 3)
      })

      it('check for deletes csv', () => {
        checkFileLength(firstSyncOutputDir, 'deletes', 'census.csv', 4)
      })
    })

    describe('sync second table', () => {
      it('start the telepods', async () => {
        const result = await startTelepods({
          client: client,
          outputDir: secondSyncOutputDir,
          source: {
            tableName: 'worldof.tomorrow',
            hashSumColumnName: 'hash_sum'
          },
          target: {
            tableName: 'government.census',
            hashSumColumnName: 'origin_hash_sum',
            where: {
              town: { equals: 'New New York' }
            }
          },
          join: {
            space_id: 'id_number' // key = source table column, value = target table column
          },
          transformFunction: function (sourceRow, callback) {
            callback(null, {
              id_number: sourceRow.spaceId,
              name: sourceRow.name,
              town: 'New New York'
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
            },
            {
              name: 'Philip J. Fry',
              origin_hash_sum: 'ABCDEFGQ',
              id_number: 20,
              town: 'New New York'
            },
            {
              name: 'Leela',
              origin_hash_sum: 'DEFGHIJK',
              id_number: 21,
              town: 'New New York'
            },
            {
              name: 'Professor Farnsworth',
              origin_hash_sum: 'GHIJKLMN',
              id_number: 22,
              town: 'New New York'
            },
            {
              name: 'Bender',
              origin_hash_sum: 'AAAAAAAA',
              id_number: 27,
              town: 'New New York'
            }
          ]
        )
      })

      it('check for inserts csv', () => {
        checkFileLength(secondSyncOutputDir, 'inserts', 'census.csv', 4)
      })

      it('check for upserts csv', () => {
        checkFileLength(secondSyncOutputDir, 'upserts', 'census.csv', 3)
      })

      it('check for deletes csv', () => {
        checkFileLength(secondSyncOutputDir, 'deletes', 'census.csv', 3)
      })
    })

    describe('sync with conflict', () => {
      it('create conflict row - matching primary key, but wrong city', async () => {
        await client.query('update government.census set origin_hash_sum = \'QQQQ\', name = \'Lila\', town = \'Nowhere\' where id_number = 21')
      })

      it('start the telepods', async () => {
        const result = await startTelepods({
          client: client,
          outputDir: thirdSyncOutputDir,
          source: {
            tableName: 'worldof.tomorrow',
            hashSumColumnName: 'hash_sum'
          },
          target: {
            tableName: 'government.census',
            hashSumColumnName: 'origin_hash_sum',
            where: {
              town: { equals: 'New New York' }
            }
          },
          join: {
            space_id: 'id_number' // key = source table column, value = target table column
          },
          transformFunction: function (sourceRow, callback) {
            callback(null, {
              id_number: sourceRow.spaceId,
              name: sourceRow.name,
              town: 'New New York'
            })
          }
        })
        expect(result).to.not.equal(null)
      })

      it('check empty inserts csv', () => {
        checkFileLength(thirdSyncOutputDir, 'inserts', 'census.csv', 1)
      })

      it('check empty upserts csv', () => {
        checkFileLength(thirdSyncOutputDir, 'upserts', 'census.csv', 1)
      })

      it('check empty deletes csv', () => {
        checkFileLength(thirdSyncOutputDir, 'deletes', 'census.csv', 2)
      })

      it('check conflict csv has one row', () => {
        checkFileLength(thirdSyncOutputDir, 'conflicts', 'census.csv', 3)
      })
    })

    after('uninstall test schemas', () => {
      return client.runFile(path.resolve(__dirname, 'fixtures', 'uninstall-test-schemas.sql'))
    })

    after('close database connections', () => {
      client.end()
    })
  }
)
