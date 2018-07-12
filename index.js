const { EventEmitter } = require('events')
const d3 = require('d3-array')

class Bench extends EventEmitter {
  constructor (options) {
    super()
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)
  }

  async run (fn) {
    if (typeof fn !== 'function') throw new Error('fn is not a function')
    if (this._inProggress) throw new Error('already started')
    this._inProggress = true
    this.cycles = 0
    this._successResults = {}
    this._failedResults = {}
    const threads = []

    const startTime = process.hrtime()
    this.intervalObject = setInterval(() => {
      const percents = (this.cycles * 100) / this.options.cycles
      this.emit(EVENTS.UPDATE, { percents })
    }, 1000)

    for (let i = 0; i < this.options.concurrency; i++) {
      threads.push(this._runThread(fn))
    }
    await Promise.all(threads)
    clearInterval(this.intervalObject)
    const finishTime = process.hrtime(startTime)
    const results = this._getResults(this._successResults, this._failedResults, finishTime)
    this._inProggress = false
    return results
  }

  _getResults (successed, failed, total) {
    const successedArr = Object.values(successed).map(([s, ns]) => (s * NS_PER_SEC + ns) / 1e6)
    const failedArr = Object.values(failed).map(([s, ns]) => (s * NS_PER_SEC + ns) / 1e6)
    const totalTime = total[0] * 1000 + total[1] / 1000000
    return {
      raw: { successed, failed },
      successed: successedArr.length ? Bench._getStats(successedArr) : null,
      failed: failedArr.length ? Bench._getStats(failedArr) : null,
      successRank: successedArr.length / this.options.cycles,
      failRank: failedArr.length / this.options.cycles,
      totalTime,
      cyclesPerSecond: this.options.cycles * 1000 / totalTime,
      options: this.options,
    }
  }

  static _getStats (array) {
    const sorted = array.sort()
    return {
      min: d3.min(sorted),
      max: d3.max(sorted),
      mean: d3.mean(sorted),
      median: d3.median(sorted),
      firstQuantile: d3.quantile(sorted, 0.25),
      thirdQuantile: d3.quantile(sorted, 0.75),
      '0.99': d3.quantile(sorted, 0.99),
      variance: d3.variance(sorted),
      deviation: d3.deviation(sorted),
    }
  }

  async _runThread (fn) {
    while (this.cycles < this.options.cycles) {
      const id = this.cycles
      this.cycles++
      const time = process.hrtime()
      let diff
      try {
        await fn()
        diff = process.hrtime(time)
        this._successResults[id] = diff
      } catch (error) {
        diff = process.hrtime(time)
        this._failedResults[id] = diff
        this.emit(Bench.EVENTS.FAIL, { error, id })
      }
      const delayMs = Math.max(this.options.minDelay - Bench._toMs(diff), 0)
      await this._delay(delayMs, this.options.randomize)
    }
  }

  static _toMs ([s, ns]) {
    return (s * NS_PER_SEC + ns) / 1e6
  }

  _delay (ms, randomize) {
    const minus = Math.random() > 0.5
    const delta = Math.round(Math.random() * randomize)
    const delay = Math.max(minus ? ms - delta : ms + delta, 0)
    return new Promise(resolve => setTimeout(resolve, delay))
  }
}

const EVENTS = Bench.EVENTS = {
  UPDATE: 'update',
  FAIL: 'fail',
}
const NS_PER_SEC = 1e9
const DEFAULT_OPTIONS = {
  concurrency: 1,
  cycles: 1,
  minDelay: 0,
  randomize: 0,
}

module.exports = {
  Bench: Bench,
}
