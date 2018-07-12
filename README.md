# bench
async benchmarking tool for nodejs based on process.hrtime

suitable for benchmarking with precision more than 2 ms

```javascript
const {Bench} = require('bench')
const ab = new Bench({
  concurrency: 5, // optional, default 1
  cycles: 10, // optional, default 1
  minDelay: 1000, // optional, default 0
  randomize: 100, // optional, default 0
})

ab.on(Bench.EVENTS.UPDATE, ({percents}) => console.log(`${percents}% done...`))
ab.on(Bench.EVENTS.FAIL, ({error, id}) => console.error(error))

const results = await ab.run(()=>{
  return new Promise(resolve => setTimeout(resolve, 500))
})
console.log(results)

// prints results in ms
// {
//   'raw': { 'successed': {...}, 'failed': {...} },
//   'successed': {
//     'min': 4.63933,
//     'max': 96.693322,
//     'mean': 51.4680112,
//     'median': 49.557461,
//     'firstQuantile': 4.63933,
//     'thirdQuantile': 94.68499,
//     '0.99': 96.61298871999999,
//     'variance': 1921.4861022466966,
//     'deviation': 43.83475906454485,
//   },
//   'failed': null,
//   'successRank': 1,
//   'failRank': 0,
//   'totalTime': 171.323604,
//   'cyclesPerSecond': 29.184536650303016,
//   'options': { 'concurrency': 2, 'cycles': 5, 'minDelay': 0, 'randomize': 0 },
// }
```
where

**concurrency** - number of cycles to run in parallel

**cycles** - number of iterations

**minDelay** - minimum delay in ms between cycles. 
If cycle execution time \> minDelay than delay = 0

**randomize** - randomize delay up to this value in ms
