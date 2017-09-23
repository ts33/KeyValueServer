const express = require('express')
const bodyParser = require('body-parser')
var store = require('./store.js')

const port = 3000
const app = express()
// parse application/json
app.use(bodyParser.json())


function send_json_response(res, result){

  res.setHeader('Content-Type', 'application/json')

  if ('error' in result) {
    res.statusCode = 400
    res.send(JSON.stringify(result))
  } else {
    res.statusCode = 200
    res.send(JSON.stringify(result))
  }
}


app.get('/object/:key', function (req, res) {
  console.log(`Received a GET request on key ${req.params.key}`)
  result = store.read(req.params.key, req.query.timestamp)
  send_json_response(res, result)
})


app.post('/object', function (req, res) {
  console.log(`Received a POST request with key ${req.body['key']}`)
  result = store.save(req.body['key'], req.body['value'])
  send_json_response(res, result)
})


app.get('/reset', function (req, res) {
  console.log('Received a request to reset database')
  store.reset()
  send_json_response(res, {'message': 'database reset'})
})


app.listen(port, function () {
  console.log('Example app listening on port 3000!')
})
