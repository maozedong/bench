const { expect } = require('chai')
const sinon = require('sinon')
const { Bench } = require('../index')

describe('node-ab', function () {
  it('should run 10 cycles', async function () {
    const ab = new Bench({ cycles: 10 })
    const spy = sinon.spy()
    await ab.run(spy)
    expect(spy.callCount).to.eq(10)
  })

  it('should respect minDelay', async function () {
    const ab = new Bench({ cycles: 2, minDelay: 100 })
    const { successed } = await ab.run(() => {})
    expect(successed.max < 100, 'mean exec time should be less than minDelay').to.eq(true)
  })

  it('should produce correct aggregation metrics', async function () {
    const ab = new Bench({ cycles: 5, concurrency: 2 })
    const results = await ab.run(() => delay(Math.floor(Math.random() * 100)))
    expect(results.successed.min <= results.successed.median, 'min <= median').to.eq(true)
    expect(results.successed.firstQuantile <= results.successed.median, 'firstQuantile <= median').to.eq(true)
    expect(results.successed.median <= results.successed.thirdQuantile, 'median <= thirdQuantile').to.eq(true)
    expect(results.successed.thirdQuantile <= results.successed['0.99'], 'thirdQuantile <= 0.99').to.eq(true)
    expect(results.successed['0.99'] <= results.successed.max, '0.99 <= max').to.eq(true)
  })
})

function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
