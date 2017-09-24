const express = require('express');
const bodyParser = require('body-parser');
let store = require('./store.js');
let dbHelper = require('./db_helper.js');


const pool = dbHelper.connectDb();
const port = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());


function sendJsonResponse(res, result) {
  if ('error' in result) {
    res.statusCode = 400;
  } else {
    res.statusCode = 200;
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(result));
}


app.get('/object/:key', function(req, res) {
  console.log(`Received a GET request on key ${req.params.key}`);
  store.read(pool, req.params.key, req.query.timestamp, function(err, result) {
    sendJsonResponse(res, result);
  });
});


app.post('/object', function(req, res) {
  console.log(`Received a POST request with key ${req.body['key']}`);
  store.save(pool, req.body['key'], req.body['value'], function(err, result) {
    sendJsonResponse(res, result);
  });
});


app.get('/reset', function(req, res) {
  console.log('Received a request to reset database');
  store.reset(pool, function(err) {
    sendJsonResponse(res, {'message': 'database reset'});
  });
});


// start the app after the db has finished setting up
dbHelper.setupDb(pool, function() {
  app.listen(port, function() {
    console.log('App listening on port 3000!');
  });
});
