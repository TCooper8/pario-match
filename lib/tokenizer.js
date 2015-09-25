'use strict'

module.exports = function(input) {
  let tokens = input.split(/[ ,]+/)

  let index = -1

  this.peek() = () => {
    return tokens[index+1]
  }

  this.next() = {
    return tokens[++index]
  }
}
