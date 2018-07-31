/* eslint-env mocha */

const expect = require('chai').expect

const generateWhereClause = require('../lib/generate-where-clause')

describe('where clause generation', () => {
  const tests = [
    {
      label: 'equals string',
      where: { town: { equals: 'Springfield' } },
      expected: 'WHERE source.town = \'Springfield\'',
      tableName: 'source'
    },
    {
      label: 'equals 10',
      where: { age: { equals: 10 } },
      expected: 'WHERE age = 10'
    },
    {
      label: 'equals O\'Reilly',
      where: { surname: { equals: 'O\'Reilly' } },
      expected: 'WHERE surname = \'O\'\'Reilly\''
    },
    {
      label: 'equals Smith or Jones',
      where: { surname: { equals: ['Smith', 'Jones'] } },
      expected: 'WHERE (surname = \'Smith\' OR surname = \'Jones\')'
    },
    {
      label: 'greater than 5 and less than 10',
      where: { age: { moreThan: 5, lessThan: 10 } },
      expected: 'WHERE age > 5 AND age < 10'
    },
    {
      label: 'greater than or equal 0 and less than or equal 99',
      where: { age: { moreThanEquals: 0, lessThanEquals: 99 } },
      expected: 'WHERE age >= 0 AND age <= 99'
    },
    {
      label: 'equals Smith or Jones, greater than 5 and less than 10',
      where: {
        surname: { equals: ['Smith', 'Jones'] },
        age: { moreThan: 5, lessThan: 10 }
      },
      expected: 'WHERE (surname = \'Smith\' OR surname = \'Jones\') AND age > 5 AND age < 10'
    }
  ]

  for (const test of tests) {
    it(test.label, () => {
      const where = generateWhereClause(test.where, test.tableName)
      expect(where).to.eql(test.expected)
    })
  }

  it('unknown comparator fails', () => {
    const f = () => generateWhereClause({ field: { cromulant: true } })
    expect(f).to.throw()
  })

  it('object in comparison fails', () => {
    const f = () => generateWhereClause({ field: { equals: { fruit: 'tooty' } } })
    expect(f).to.throw()
  })
})
