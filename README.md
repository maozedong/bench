# node-ab
async benchmarking tool for nodejs based on process.hrtime
suitable for benchmarking with precision more than 10 ms

###example
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
// { raw: { successed: {...}, failed: {...}},
//   successed: 
//    { min: 499.636366,
//      max: 501.797948,
//      mean: 501.06490170000006,
//      median: 501.24732500000005,
//      firstQuantile: 501.641905,
//      thirdQuantile: 499.96806525,
//      variance: 0.5229299790973269,
//      deviation: 0.7231389763367252 },
//   failed: null,
//   successRank: 1,
//   failRank: 0,
//   totalTime: 2146.468911,
//   cyclesPerSecond: 4.658814273411109,
//   options: { concurrency: 5, cycles: 10, minDelay: 1000, randomize: 100 } }
```
where

**concurrency** - number of cycles to run in parallel

**cycles** - number of iterations

**minDelay** - minimum delay in ms between cycles. 
If cycle execution time \> minDelay than delay = 0

**randomize** - randomize delay up to this value in ms
