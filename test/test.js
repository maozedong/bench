const {expect} = require('chai')
const sinon = require('sinon')
const {Bench} = require('../index')

describe('node-ab', function () {
  it('should run 10 cycles', async function () {
    const ab = new Bench({cycles: 10})
    const spy = sinon.spy()
    await ab.run(spy)
    expect(spy.callCount).to.eq(10)
  })

  it('should respect minDelay', async function () {
    const ab = new Bench({cycles: 2, minDelay: 100})
    const {successed} = await ab.run(()=>{})
    expect(successed.max < 100, 'mean exec time should be less than minDelay').to.eq(true)
  })
})
