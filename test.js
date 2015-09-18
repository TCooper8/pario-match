'use strict'

let Match = require('./lib/index.js')
let option = require('pario-monad').option
let _ = require('lodash')

let matchType = Match()
  .type(Number)( x => 2 * x )
  .type(Array)( [1,2] )
  .type('string')( str => 'Hello ' + str)
  .bind

let matchNumber = Match()
  .if( x => x === 0 )( 1 )
  .else( x => matchNumber(x-1) + 1 )
  .bind

let sum = ls => {
  let loop = acc => Match()
    .empty( acc )
    .cons( (h,t) => loop(acc + h)(t) )
    .bind

  return loop(0)(ls)
}

let fold = folder => state => Match()
  .empty( state )
  .cons( (h, t) => fold(folder)(folder(state)(h))(t) )
  .bind

let sum2 = ls => fold
  (acc => i => acc + i)
  (0)(ls)

console.log(matchNumber(50))
console.log(sum(_.range(1000)))
console.log(sum2(_.range(1000)))
