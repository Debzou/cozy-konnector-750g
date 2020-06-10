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
// scrapping by page 
// you can fix a limit (if you want)
const minpage = 0
const maxpage = 10

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
  log('info', `your pseudo is ${pseudo} !`)
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
  let dictCategory = new Object()
  $('div .c-link-img-txt-col__header').each((index, element) => {
    let link = baseurl + $(element)
      .find('a')
      .attr('href')
    let category_name = $(element)
      .find('span')
      .text()
      .replace('\'', '')
    dictCategory[category_name] = link    
  })
  return dictCategory
}

async function getRecipe(dict){
  let dictRecipe = new Object()
  for(let attr in dict){
    // init numero page
    let numpage = minpage
    // init array
    dictRecipe[attr] = []  
    while( (numpage !== -1) && (numpage < maxpage)){
      log('info',`scrape the page ${dict[attr]}?page=${numpage} ...`)
      // get html
      let $ = await getPage(`${dict[attr]}?page=${numpage}`)
      // gather names of recipes
      if($('.c-row__body').length > 0){
        numpage += 1
        $('.c-row__body').each((index, element) => {
          // init recipe 
          let recipe = new Object()
          let title = $(element).find('a').text()
          let link = baseurl + $(element).find('a').attr('href')   
          // create dictionary of recipes
          recipe.title = title
          recipe.link = link
          dictRecipe[attr].push(recipe)   
        })
      }else{
        numpage = -1
      }
    }   
  }
  log('info',dictRecipe)
}