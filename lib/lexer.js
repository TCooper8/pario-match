'use strict'

let Assert = require('assert')
let Xregex = require('xregexp')
let Tokens = require('./tokens.js')
let _ = require('lodash')

let sprintf = require('util').format

let CharStream = function(input) {
  let length = input.length
  let index = -1
  let linenumber = 0

  this.index = () =>
    index

  this.linenumber = () =>
    linenumber

  this.next = () => {
    ++index
    let _char = input[index]
    if (_char === '\n')
      ++linenumber

    return _char
  }

  this.peek = () =>
    input[index + 1]

  this.seek = i =>
    index += i

  this.available = () =>
    Math.max(length - index, 0)

  this.end = () =>
    index >= length - 1
}

let regexpCache

let regexp = key => seq => {
  let expr = regexpCache[key]

  if (_.isUndefined(expr)) {
    throw new Error(sprintf(
      'regexp %s is not defined',
      key
    ))
  }

  if (_.has(expr, 'test')) {
    return expr.test(seq)
  }
  else if (expr instanceof RegExp) {
    return expr.test(seq)
  }
  else {
    return expr(seq)
  }
}

regexpCache = {
  'newline': /\n|\r|\n\r/,
  'whitespace': /\s+/,
  'digit-char': /[0-9]/,
  'letter-char': /[a-zA-Z]/,
  'connecting-char': Xregex('\\p{Pc}'),
  'combining-char': Xregex('\\p{Mn}|\\p{Mc}'),
  'formatting-char': Xregex('\\p{Cf}'),
  'ident-start-char': seq => {
    console.log('%s is letter-char ? %s', seq, regexp('letter-char')(seq) || (seq === '_'))

    return regexp('letter-char')(seq) ||
      (seq === '_')
  },
  'ident-char': seq => {
    return regexp('letter-char')(seq) ||
       regexp('digit-char')(seq) ||
       regexp('connecting-char')(seq) ||
       regexp('combining-char')(seq) ||
       regexp('formatting-char')(seq) ||
       (seq === '\'') ||
       (seq === '_')
  },
  'ident-text': seq => {
    console.log('testing ident-text')
    var i = 0, length = seq.length

    console.log(seq.length)
    console.log(seq)

    if (seq === undefined) return false
    if (length === 0) return false

    console.log('testing ident-start-char')
    console.log('%s is ident-start-char ? %s', seq[i], regexp('ident-start-char')(seq[i]))

    if (! regexp('ident-start-char')(seq[i])) {
      console.log('not an ident start char')
      return false
    }

    while(++i < length) {
      if (! regexp('ident-char')(seq[i]))
        return false
    }

    return true
  },
  'simple-char-char': /[^\n\t\rb\a\f\v]+/,
  'char-char': regexp('simple-char-char'),
  'digit': /[0-9]/,
  'int': seq => /[0-9]+/,
  'string': seq => {
    if (seq === undefined) return false

    var i = 0, length = seq.length
    if (seq[i] !== '"') return false
    if (seq[length-1] !== '"') return false

    while (++i < length-1) {
      if (! regexp('char-char')(seq[i])) {
        console.log('%s is not a valid string character', seq[i])
        return false
      }
    }

    return true
  }
}

let resolveGrammar = tokens => {

}

module.exports = function(input) {
  let stream = new CharStream(input)
  let tokens = []
  let acc = ''

  let getToken

  let getWhitespaceOrNewlineTok = () => {
    console.log('testing getWhitespaceOrNewlineTok')

    let acc = ''
    let _char = stream.peek()

    while (regexp('newline')(_char) || regexp('whitespace')(_char)) {
      acc += stream.next()
      _char = stream.peek()
      console.log(acc)
    }

    return acc.length === 0 ?
      undefined :
      Tokens.WhitespaceOrNewline(acc)
  }

  let getStringLikeToken = () => {
    let acc = stream.next()
    let _char = stream.peek()

    console.log('Checking string %s', acc + _char)

    while (_char !== '"') {
      if (stream.end()) {
        throw new Error('Expected closing quote for string')
      }
      acc += stream.next()
      _char = stream.peek()
    }
    acc += stream.next()

    console.log('Checking if %s is a string', acc)

    if (! regexp('string')(acc)) {
      throw new Error(sprintf('%s is not a valid string', acc))
    }

    console.log('%s is a string', acc)

    return acc.length === 0 ?
      false : Object({
        value: acc.slice(1, acc.length-1),
        token: 'String'
      })
  }
  let peekStringLike = () => {
    let _char = stream.peek()
    if (_char === '"') {
      return getStringLikeToken()
    }
    else return false
  }

  let getNumberLike = () => {
    let acc = ''
    let _char = stream.peek()

    while (!stream.end() && regexp('digit')(_char)) {
      acc += stream.next()
      _char = stream.peek()
      console.log(acc)
    }

    if (stream.end()) {
      return {
        value: parseInt(acc),
        token: 'Integer'
      }
    }

    if (_char === '.') {
      console.log('Grabbing token')
      let linenumber = stream.linenumber()
      let index = stream.index()

      let tail = getToken()
      if (!tail) {
        throw new Error(sprintf(
          'Expected method call or decimal value after "." on line %s:%s',
          linenumber,
          index
        ))
      }

      if (tail.token === 'Integer') {
        return {
          value: parseFloat(sprintf('%s.%s', acc, tail.value)),
          token: 'Float'
        }
      }

      throw new Error(sprintf(
        'Expected valid number following dot on line %s:%s',
        linenumber,
        index
      ))
    }

    return {
      value: parseInt(acc),
      type: 'Integer'
    }
  }

  let peekNumberLike = () => {
    let _char = stream.peek()
    if (regexp('digit') || _char === '.') {
      return getNumberLike()
    }
    return false
  }

  getToken = () => {
    if (stream.end()) {
      return
    }
    let tok

    tok = getWhitespaceOrNewlineTok()
    if (tok) {
      tokens.push(tok)
      return getToken()
    }

    tok = peekStringLike()
    if (tok) {
      tokens.push(tok)
      return getToken()
    }

    tok = peekNumberLike()
    if (tok) {
      tokens.push(tok)
      return getToken()
    }

    throw new Error('Unable to match token')
  }

  getToken()

  console.log(tokens)
}
