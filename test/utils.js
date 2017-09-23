let request = require('request');


const baseUrl = process.env.URL;


// no operation function
function noop() {}


// wrapper method to reset database
function resetDb(callback) {
  request.get(baseUrl + '/reset', function(err, res, body) {
    if (err) {
      return console.error('failed to send request: ', err);
    }
    callback();
  });
}


// wrapper method to prepare POST request
function preparePost(url, data, contentType) {
  return {
    headers: {'content-type': contentType},
    url: url,
    body: data,
  };
}


// wrapper method for POST
function sendPost(postRequest, validate, callback) {
 request.post(postRequest, function(err, res, body) {
   if (err) {
     return console.error('failed to send request: ', err);
   }

   validate(res, JSON.parse(body));
   callback();
 });
}


// wrapper method for GET
function sendGet(url, validate, callback) {
  request.get(url, function(err, res, body) {
    if (err) {
      return console.error('failed to send request: ', err);
    }

    validate(res, JSON.parse(body));
    callback();
  });
}


module.exports.baseUrl = baseUrl;

module.exports.noop = noop;

module.exports.resetDb = resetDb;

module.exports.preparePost = preparePost;

module.exports.sendPost = sendPost;

module.exports.sendGet = sendGet;
