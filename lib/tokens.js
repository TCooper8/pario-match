'use strict'

exports.WhitespaceOrNewline = seq => Object({
  seq: seq,
  tok: 'whitespace-or-newline'
})

exports.IdentTok = seq => Object({
  seq: seq,
  tok: 'ident'
})

