'use strict'

let Assert = require('assert')
let match = require('../lib')
let option = require('pario-monad').option
let Pato = require('pato')
let _ = require('lodash')

let timed = iters => f => {
  let ti = new Date()
  _.times(iters - 1, f)
  let res = f(iters - 1)
  let tf = new Date()
  let dt = (tf - ti) / 1000.0

  console.log('%s seconds', dt)
  return res
}

describe('Should test matching', () => {
  it('should match pato', () => {

    let f = match()
      .if(x => typeof x === 'string')( 5 )
      .type(String)( 'hello' )
      .else( 5 )
      .bind

    let g = value => Pato.match(value)
      .type('string').then( 'hello' )
      .type('number').then( 5 )
      .done()

    Assert.equal(
      timed(1000000)( () => f(5) ),
      timed(1)( () => g(5) )
    )
  })
})
