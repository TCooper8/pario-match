'use strict'

let Assert = require('assert')
let Match = require('../lib/index.js')
let _ = require('lodash')

describe('Testing match for multiple keys', () => {
  it('should extract the values from the keys', () => {
    Match()
      .get([ 'name', 'id' ])( _.spread( (name, id) => {
        Assert.equal(name, 'bob')
        Assert.equal(id,  7)
      }))
      //.get([ 'name', 'id' ])( values => {
      //  Assert.equal(values[0], 'bob')
      //  Assert.equal(values[1], 7)
      //})
      .bind({
        name: 'bob',
        id: 7
      })
  })
})
