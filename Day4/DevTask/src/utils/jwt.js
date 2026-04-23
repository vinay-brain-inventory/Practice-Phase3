const jwt = require('jsonwebtoken')

function parseBearerToken(value) {
  if (!value) return ''
  const parts = String(value).split(' ')
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') return parts[1]
  return ''
}

function verifyToken(token, secret) {
  return jwt.verify(token, secret)
}

module.exports = { parseBearerToken, verifyToken }

