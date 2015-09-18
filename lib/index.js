'use strict'

let option = require('pario-monad').option
let _ = require('lodash')

let cons = ls => f => f(_.first(ls), _.rest(ls))

function Match(patterns) {
  if (_.isFunction(patterns)) {
    this.patterns = [ patterns ]
  }
  else {
    this.patterns = patterns || []
  }

  this.bind = value => {
    let loop = acc =>
      acc.length === 0 ?
        option.none : cons(acc)( (h,t) => {
          let res = h(value)
          return res.isSome() ?
            res : loop(t)
        })

    let res = loop(this.patterns)
    if (res.isSome()) {
      return res.get()
    }
    throw new Error('Value could not be matched by expression')
  }
}

Match.prototype.addPattern = function(pattern) {
  this.patterns.push(pattern)
  return this
}

Match.prototype.empty = function(mapping) {
  if (_.isFunction(mapping)) {
    return this.addPattern( ls =>
      ls.length === 0 ?
        option.some(mapping(ls)) :
        option.none
    )
  }
  return this.addPattern( ls =>
    ls.length <= 0 ?
      option.some(mapping) :
      option.none
  )
}

Match.prototype.cons = function(mapping) {
  return this.addPattern( ls =>
    option.some(mapping(_.first(ls), _.rest(ls)))
  )
}

Match.prototype.pair = function(mapping) {
  return this.addPattern( (first, second) =>
    option.some(mapping(first, second))
  )
}

Match.prototype.if = function(predicate) {
  let self = this

  return mapping => {
    if (_.isFunction(mapping)) {
      return self.addPattern( value =>
        predicate(value) ?
          option.some(mapping(value)) :
          option.none
      )
    }
    else {
      return self.addPattern( value =>
        predicate(value) ?
          option.some(mapping) :
          option.none
      )
    }
  }
}

Match.prototype.else = function(mapping) {
  if (_.isFunction(mapping)) {
    return this.addPattern( value =>
      option.some(mapping(value))
    )
  }
  return this.addPattern( value =>
    option.some(value)
  )
}

Match.prototype.type = function(typeclass) {
  let self = this

  let typeCheck = value =>
    _.isString(typeclass) ?
      typeof value === typeclass :
         value instanceof typeclass
      || value.constructor === typeclass

  return mapping => {
    if (_.isFunction(mapping)) {
      return self.addPattern( value =>
        typeCheck(value) ?
          option.some(mapping(value)) :
          option.none
      )
    }
    else {
      return self.addPattern( value =>
        typeCheck(value) ?
          option.some(mapping) :
          option.none
      )
    }
  }
}

Match.prototype.bind = function(value) {
  let loop = acc =>
    acc.length === 0 ?
      option.none : cons(acc)( (h,t) => {
        let res = h(value)
        return res.isSome() ?
          res : loop(t)
      })

  let res = loop(this.patterns)
  if (res.isSome()) {
    return res.get()
  }
  throw new Error('Value could not be matched by expression')
}

module.exports = patterns => {
  let match = new Match(patterns)

  return match
}
