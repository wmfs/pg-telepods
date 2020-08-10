/* eslint-env mocha */

const expect = require('chai').expect

const generateWhereClause = require('../lib/generate-where-clause')

describe('where clause generation', () => {
  const tests = [
    {
      label: 'equals string',
      where: { town: { equals: 'Springfield' } },
      expected: 'source.town = \'Springfield\'',
      expectedInverted: 'not((source.town = \'Springfield\' and source.town is not null))',
      tableName: 'source'
    },
    {
      label: 'equals 10',
      where: { age: { equals: 10 } },
      expected: 'age = 10',
      expectedInverted: 'not(age = 10)'
    },
    {
      label: 'equals true',
      where: { flowers: { equals: true } },
      expected: 'flowers = true',
      expectedInverted: 'not(flowers = true)'
    },
    {
      label: 'equals escaped string',
      where: { town: { equals: 'Spri\\ngfield' } },
      expected: 'source.town = E\'Spri\\\\ngfield\'',
      expectedInverted: 'not((source.town = E\'Spri\\\\ngfield\' and source.town is not null))',
      tableName: 'source'
    },
    {
      label: 'equals O\'Reilly',
      where: { surname: { equals: 'O\'Reilly' } },
      expected: 'surname = \'O\'\'Reilly\'',
      expectedInverted: 'not((surname = \'O\'\'Reilly\' and surname is not null))'
    },
    {
      label: 'equals Smith or Jones',
      where: { surname: { equals: ['Smith', 'Jones'] } },
      expected: '(surname = \'Smith\' OR surname = \'Jones\')',
      expectedInverted: 'not(((surname = \'Smith\' and surname is not null) OR (surname = \'Jones\' and surname is not null)))'
    },
    {
      label: 'greater than 5 and less than 10',
      where: { age: { moreThan: 5, lessThan: 10 } },
      expected: 'age > 5 AND age < 10',
      expectedInverted: 'not(age > 5 AND age < 10)'
    },
    {
      label: 'greater than or equal 0 and less than or equal 99',
      where: { age: { moreThanEquals: 0, lessThanEquals: 99 } },
      expected: 'age >= 0 AND age <= 99',
      expectedInverted: 'not(age >= 0 AND age <= 99)'
    },
    {
      label: 'equals Smith or Jones, greater than 5 and less than 10',
      where: {
        surname: { equals: ['Smith', 'Jones'] },
        age: { moreThan: 5, lessThan: 10 }
      },
      expected: '(surname = \'Smith\' OR surname = \'Jones\') AND age > 5 AND age < 10',
      expectedInverted: 'not(((surname = \'Smith\' and surname is not null) OR (surname = \'Jones\' and surname is not null)) AND age > 5 AND age < 10)'
    },
    {
      label: 'no where clause',
      expected: '1=1'
    }
  ]

  for (const test of tests) {
    it(test.label, () => {
      const where = generateWhereClause(test.where, test.tableName)
      expect(where).to.eql(test.expected)
    })
  }

  for (const test of tests) {
    if (test.expected === '1=1') continue
    it(`not(${test.label})`, () => {
      const where = generateWhereClause.inverted(test.where, test.tableName)
      expect(where).to.eql(test.expectedInverted)
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
