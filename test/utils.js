var request = require('request')


const base_url = process.env.URL


// no operation function
function noop(){}


// wrapper method to reset database
function reset_db(callback){

  request.get(base_url + '/reset', function (err, res, body){
    if (err) {
      return console.error('failed to send request: ', err)
    }
    callback()
  })

}


// wrapper method to prepare POST request
function prepare_post(url, data, contentType){
  return {
    headers: {'content-type' : contentType},
    url: url,
    body:  data
  }
}


// wrapper method for POST
function send_post(postRequest, validate, callback) {

 request.post(postRequest, function(err, res, body) {
   if (err) {
     return console.error('failed to send request: ', err)
   }

   validate(res, JSON.parse(body))
   callback()
 })

}


// wrapper method for GET
function send_get(url, validate, callback){

  request.get(url, function (err, res, body){
    if (err) {
      return console.error('failed to send request: ', err)
    }

    validate(res, JSON.parse(body))
    callback()
  })

}


module.exports.base_url = base_url

module.exports.noop = noop

module.exports.reset_db = reset_db

module.exports.prepare_post = prepare_post

module.exports.send_post = send_post

module.exports.send_get = send_get
