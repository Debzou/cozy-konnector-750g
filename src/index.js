// ###################
// ##  RUN
// ##  yarn standalone
// ###################

// ###################
// ##  LIBRARY
// ###################

const { BaseKonnector, log } = require('cozy-konnector-libs')
const qs = require('querystring')
const rp = require('request-promise')
// const moment = require('moment')
// const cheerio = require('cheerio')

// ###################
// ##  CONSTANT
// ###################

const cookiejar = rp.jar()

// ###################
// ##  Konnector
// ###################

module.exports = new BaseKonnector(start)

// main
async function start(fields) {
  log('info', 'Authenticating ...')
  try {
    await authenticate(fields)
    log('info', 'Successfully logged in')
  } catch (error) {
    throw new Error(error.message)
  }
}

function authenticate(fields) {
  const authRequest = {
    method: 'POST',
    uri: 'https://www.750g.com/connexion.htm',
    jar: cookiejar,
    headers: {
      Host: 'www.750g.com',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      email: fields.login,
      password: fields.password
    },
    followAllRedirects: true
  }
  // Reset Content-Length header since Enedis auth wants Title-Cased Headers
  const authRequestLength = Buffer.byteLength(qs.stringify(authRequest.form))
  authRequest.headers['Content-Length'] = authRequestLength
  return rp(authRequest)
    .catch(() => {
      throw new Error(errors.LOGIN_FAILED)
    })
    .then($ => log('info', $))
}
