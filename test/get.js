'use strict'

let Assert = require('assert')
let Match = require('../lib/index.js')
let _ = require('lodash')

describe('Testing match for multiple keys', () => {
  it('should extract the values from the keys', () => {
    Match()
      .get('name', 'id')( (name, id) => {
        Assert.equal(name, 'bob')
        Assert.equal(id,  7)
      })
      .bind({
        name: 'bob',
        id: 7
      })

    Match()
    .get({ name: String, id: 7 })( (name, id) => {
      Assert.equal(name, 'bob')
      Assert.equal(id, 7)
    })
    .bind({
      name: 'bob',
      id: 7
    })
  })
})
