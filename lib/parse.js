'use strict'

let regexCache

let regexp = key => seq => {
  let reg = regexCache[key]
  return reg.test(seq)
}

regexCache = {
}

let getTokens = input => {
  let parts = input.split(/[ ,]+|[z-zA-Z0-9]+|\n|\r|\r\n/)

  let getToken = part => {
    let _char = part[0]
    if (_char === '"') {
      // This is a string token.

    }
  }

  return
}

module.exports = input => {
  let tokens = _.reduce(
}
