// ###################
// ##  RUN
// ##  yarn standalone
// ###################

// ###################
// ##  LIBRARY
// ###################

const { BaseKonnector, log, errors } = require('cozy-konnector-libs')
const qs = require('querystring')
const rp = require('request-promise')
const cheerio = require('cheerio')
const fs = require('fs')
// const moment = require('moment')

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

async function authenticate(fields) {
  // go inspected element : network > hearder & cookie & request
  const authRequest = {
    method: 'POST',
    uri: 'https://www.750g.com/login_check',
    jar: cookiejar,
    headers: {
      Host: 'www.750g.com',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      email: fields.login,
      password: fields.password,
      redirect_url: '',
      client_id: ''
    },
    followAllRedirects: true
  }
  // request
  const authRequestLength = Buffer.byteLength(qs.stringify(authRequest.form))
  authRequest.headers['Content-Length'] = authRequestLength
  return rp(authRequest)
    .catch(() => {
      throw new Error(errors.LOGIN_FAILED)
    })
    .then(html => getName(html))
}

async function getName(html) {
  const $ = cheerio.load(html)
  const value = $('span .c-header-details__label-truncate')
    .text()
    .trim()
  fs.writeFile('./html.html', $.text(), err => {
    if (err) return console.log(err)
  })
  log('info', value)
}
