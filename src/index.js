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

// ###################
// ##  CONSTANT
// ###################

const baseurl = 'https://www.750g.com'
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
    log('info', 'get page ...')
    const page = await getPage(
      'https://www.750g.com/home_rubrique_-_recettes.htm'
    )
    log('info', 'get Category ...')
    const dictCategory = await getCategory(page)
    await getRecipe(dictCategory)
  } catch (error) {
    throw new Error(error.message)
  }
}

async function authenticate(fields) {
  const authRequest = {
    method: 'POST',
    uri: `${baseurl}/login_check`,
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
  // load html
  const $ = cheerio.load(html)

  // scrape pseudo
  const pseudo = $('span .c-header-details__label-truncate')
    .text()
    .trim()

  // display pseudo
  log('info', pseudo)
}

async function getPage(url) {
  const options = {
    uri: url,
    transform: function(body) {
      return cheerio.load(body)
    }
  }

  return rp(options)
}

async function getCategory($) {
  const dictCategory = new Object()
  $('div .c-link-img-txt-col__header').each((index, element) => {
    let link = baseurl + $(element)
      .find('a')
      .attr('href')
    let category_name = $(element)
      .find('span')
      .text()
      .replace('\'', '')
    log('info', link)
    log('info', category_name)
    dictCategory[category_name] = link    
  })
  return dictCategory
}

async function getRecipe(dict){
  log('info',dict)
}