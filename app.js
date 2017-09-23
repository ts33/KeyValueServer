const express = require('express');
let check = require('check-types');
const bodyParser = require('body-parser');
const {Pool} = require('pg');
let store = require('./store.js');
let sqlCommands = require('./sql_commands.js');


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

pool.query(sqlCommands.createKvTable, (err, res) => {
  if (err) {
    console.log(err.stack);
  }
});

const port = process.env.PORT || 3000;
const app = express();
// parse application/json
app.use(bodyParser.json());


function sendJsonResponse(res, result) {
  res.setHeader('Content-Type', 'application/json');

  if ('error' in result) {
    res.statusCode = 400;
    res.send(JSON.stringify(result));
  } else {
    res.statusCode = 200;
    res.send(JSON.stringify(result));
  }
}


app.get('/object/:key', function(req, res) {
  console.log(`Received a GET request on key ${req.params.key}`);
  timestamp = null;
  if (check.maybe(req.query.timestamp) != true) {
    timestamp = parseInt(req.query.timestamp, 10);
  }
  store.read(pool, req.params.key, timestamp, function(result) {
    sendJsonResponse(res, result);
  });
});


app.post('/object', function(req, res) {
  console.log(`Received a POST request with key ${req.body['key']}`);
  store.save(pool, req.body['key'], req.body['value'], function(result) {
    sendJsonResponse(res, result);
  });
});


app.get('/reset', function(req, res) {
  console.log('Received a request to reset database');
  store.reset(pool, function() {
    sendJsonResponse(res, {'message': 'database reset'});
  });
});


app.listen(port, function() {
  console.log('Example app listening on port 3000!');
});
