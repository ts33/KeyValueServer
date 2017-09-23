var sleep = require('sleep')
var chai = require('chai')
var assert = chai.assert
var store = require('../store.js')
var utils = require('./utils.js')


const obj_url = utils.base_url + '/object'


suite('/object Post', function() {

  suite('Valid inputs', function() {

    setup(function(done) {
      utils.reset_db(done)
    })

    test('should accept and return string `value`', function(done) {
      key = 'a_bc'
      value = 'some_value'
      data = { 'key': key, 'value': value }
      ts = Date.now()

      function validate(res, parsedBody){
        assert.equal(res.statusCode, 200)
        assert.equal(parsedBody['key'], key)
        assert.equal(parsedBody['value'], value)

        diff = parsedBody['timestamp'] - ts
        assert.isBelow(diff, 50)
      }

      req = utils.prepare_post(obj_url, JSON.stringify(data), 'application/json')
      utils.send_post(req, validate, done)
    })

    test('should accept and return JSON `value`', function(done) {
      key = 'abc'
      value = { 'inner_key':'def', 'inner_value':123 }
      data = { 'key': key, 'value': value }
      ts = Date.now()

      function validate(res, parsedBody){
        assert.equal(res.statusCode, 200)
        assert.equal(parsedBody['key'], key)
        assert.deepEqual(parsedBody['value'], value)

        diff = parsedBody['timestamp'] - ts
        assert.isBelow(diff, 50)
      }

      req = utils.prepare_post(obj_url, JSON.stringify(data), 'application/json')
      utils.send_post(req, validate, done)
    })

  })

  suite('Invalid inputs', function(){

    setup(function(done) {
      utils.reset_db(done)
    })

    test('should return error if data is not JSON', function(done) {
      data = '123'

      function validate(res, parsedBody){
        assert.equal(res.statusCode, 400)
        assert.deepEqual(parsedBody, store.invalid_save_message)
      }

      req = utils.prepare_post(obj_url, data, 'plain/text')
      utils.send_post(req, validate, done)
    })

    test('should return error if key is empty string', function(done) {
      key = ''
      value = 'some_value'
      data = { 'key': key, 'value': value }

      function validate(res, parsedBody){
        assert.equal(res.statusCode, 400)
        assert.deepEqual(parsedBody, store.invalid_save_message)
      }

      req = utils.prepare_post(obj_url, JSON.stringify(data), 'application/json')
      utils.send_post(req, validate, done)
    })

    test('should return error if value is not string/JSON', function(done) {
      key = 'abc'
      value = 123
      data = { 'key': key, 'value': value }

      function validate(res, parsedBody){
        assert.equal(res.statusCode, 400)
        assert.deepEqual(parsedBody, store.invalid_save_message)
      }

      req = utils.prepare_post(obj_url, JSON.stringify(data), 'application/json')
      utils.send_post(req, validate, done)
    })

    test('should return error if key is not string', function(done) {
      key = 123
      value = 'some_value'
      data = { 'key': key, 'value': value }

      function validate(res, parsedBody){
        assert.equal(res.statusCode, 400)
        assert.deepEqual(parsedBody, store.invalid_save_message)
      }

      req = utils.prepare_post(obj_url, JSON.stringify(data), 'application/json')
      utils.send_post(req, validate, done)
    })

    test('should return error if key has characters that are not alphanumeric or _', function(done) {
      value = 'some_value'
      data1 = { 'key': 'ab-', 'value': value }
      data2 = { 'key': 'ab.', 'value': value }
      data3 = { 'key': 'ab@', 'value': value }

      function validate(res, parsedBody){
        assert.equal(res.statusCode, 400)
        assert.deepEqual(parsedBody, store.invalid_save_message)
      }

      req1 = utils.prepare_post(obj_url, JSON.stringify(data1), 'application/json')
      req2 = utils.prepare_post(obj_url, JSON.stringify(data2), 'application/json')
      req3 = utils.prepare_post(obj_url, JSON.stringify(data3), 'application/json')

      utils.send_post(req1, validate, function(){
        utils.send_post(req2, validate, function(){
          utils.send_post(req3, validate, done)
        })
      })
    })

  })

})


suite('/object/:key Get', function() {

  suite('Valid inputs', function() {

    setup(function(done) {
      utils.reset_db(done)
    })

    test('should accept string `key` and return string `value`', function(done) {
      key = 'abc'
      value = 'some_value'
      data = { 'key': key, 'value': value }
      expected = { 'value': value }

      function validate(res, parsedBody){
        assert.equal(res.statusCode, 200)
        assert.deepEqual(parsedBody, expected)
      }

      req = utils.prepare_post(obj_url, JSON.stringify(data), 'application/json')
      utils.send_post(req, utils.noop, function(){
        utils.send_get(obj_url + `/${key}`, validate, done)
      })
    })

    test('should accept string `key` and return JSON `value`', function(done) {
      key = 'abc'
      value = {'inner_key':'def', 'inner_value':123}
      data = { 'key': key, 'value': value }
      expected = { 'value': value }

      function validate(res, parsedBody){
        assert.equal(res.statusCode, 200)
        assert.deepEqual(parsedBody, expected)
      }

      req = utils.prepare_post(obj_url, JSON.stringify(data), 'application/json')
      utils.send_post(req, utils.noop, function(){
        utils.send_get(obj_url + `/${key}`, validate, done)
      })
    })

  })

  suite('Invalid inputs', function(){

    setup(function(done) {
      utils.reset_db(done)
    })

    test('should return error if key is not valid', function(done) {
      key = 'abc'
      value = 'some_value'
      data = { 'key': key, 'value': value }
      expected = store.not_found_get_message

      function validate(res, parsedBody){
        assert.equal(res.statusCode, 400)
        assert.deepEqual(parsedBody, expected)
      }

      req = utils.prepare_post(obj_url, JSON.stringify(data), 'application/json')
      utils.send_post(req, utils.noop, function(){
        utils.send_get(obj_url + '/123', validate, done)
      })
    })

    test('should return error if key has characters that are not alphanumeric or _', function(done) {
      key = 'abc'
      value = 'some_value'
      data = { 'key': key, 'value': value }
      expected = store.invalid_get_message

      function validate(res, parsedBody){
        assert.equal(res.statusCode, 400)
        assert.deepEqual(parsedBody, expected)
      }

      req = utils.prepare_post(obj_url, JSON.stringify(data), 'application/json')
      utils.send_post(req, utils.noop, function(){
        utils.send_get(obj_url + '/ab-', validate, function(){
          utils.send_get(obj_url + '/ab.', validate, function(){
            utils.send_get(obj_url + '/ab@', validate, done)
          })
        })
      })
    })

    test('should return error if timestamp is not int', function(done) {
      key = 'abc'
      value = 'some_value'
      data = { 'key': key, 'value': value }
      expected = store.invalid_get_message

      function validate(res, parsedBody){
        assert.equal(res.statusCode, 400)
        assert.deepEqual(parsedBody, expected)
      }

      req = utils.prepare_post(obj_url, JSON.stringify(data), 'application/json')
      utils.send_post(req, utils.noop, function(){
        utils.send_get(obj_url + `/${key}?timestamp=timestamp`, validate, done)
      })
    })

    test('should return error if timestamp is negative or zero', function(done) {
      key = 'abc'
      value = 'some_value'
      data = { 'key': key, 'value': value }
      expected = store.invalid_get_message

      function validate(res, parsedBody){
        assert.equal(res.statusCode, 400)
        assert.deepEqual(parsedBody, expected)
      }

      req = utils.prepare_post(obj_url, JSON.stringify(data), 'application/json')
      utils.send_post(req, utils.noop, function(){
        utils.send_get(obj_url + `/${key}?timestamp=-100`, validate, function(){
          utils.send_get(obj_url + `/${key}?timestamp=0`, validate, done)
        })
      })
    })

  })

})


suite('/reset Get', function() {

  test('should empty all records', function(done) {
    key = 'abc'
    value = 'some_value'
    data = { 'key': key, 'value': value }
    expected = store.not_found_get_message

    function validate(res, parsedBody){
      assert.equal(res.statusCode, 400)
      assert.deepEqual(parsedBody, expected)
    }

    req = utils.prepare_post(obj_url, JSON.stringify(data), 'application/json')
    utils.send_post(req, utils.noop, function(){
      utils.reset_db(function (){
        utils.send_get(obj_url + `/${key}`, validate, done)
      })
    })
  })

})


suite('/object/:key Advanced Get', function() {

  setup(function(done) {
    utils.reset_db(done)
  })

  test('should return correct value', function(done) {
    key = 'abc'
    value = 'some_value'
    data = { 'key': key, 'value': value }
    expected = { 'value': value }

    key2 = 'def'
    value2 = 'another_value'
    data2 = { 'key': key2, 'value': value2 }

    function validate(res, parsedBody){
      assert.equal(res.statusCode, 200)
      assert.deepEqual(parsedBody, expected)
    }

    req = utils.prepare_post(obj_url, JSON.stringify(data), 'application/json')
    req2 = utils.prepare_post(obj_url, JSON.stringify(data2), 'application/json')

    utils.send_post(req, utils.noop, function(){
      utils.send_post(req2, utils.noop, function(){
        utils.send_get(obj_url + `/${key}`, validate, done)
      })
    })
  })

  test('should return updated value', function() {
    key = 'abc'
    value = 'some_value'
    data = { 'key': key, 'value': value }

    value2 = 'another_value'
    data2 = { 'key': key, 'value': value2 }

    expected = { 'value': value2 }
    function validate(res, parsedBody){
      assert.equal(res.statusCode, 200)
      assert.deepEqual(parsedBody, expected)
    }

    req = utils.prepare_post(obj_url, JSON.stringify(data), 'application/json')
    req2 = utils.prepare_post(obj_url, JSON.stringify(data2), 'application/json')

    utils.send_post(req, utils.noop, function(){
      utils.send_post(req2, utils.noop, function(){
        utils.send_get(obj_url + `/${key}`, validate, done)
      })
    })
  })

  test('should return values according to timestamp', function() {
    this.timeout(3000)
    key = 'abc'
    value = 'first_value'
    value1 = 'second_value'
    value2 = 'third_value'
    data = { 'key': key, 'value': value }
    data1 = { 'key': key, 'value': value1 }
    data2 = { 'key': key, 'value': value2 }

    function validate1(res, parsedBody){
      assert.equal(res.statusCode, 400)
      assert.deepEqual(parsedBody, store.not_found_get_message)
    }
    function validate2(res, parsedBody){
      assert.equal(res.statusCode, 200)
      assert.deepEqual(parsedBody, { 'value': value })
    }
    function validate3(res, parsedBody){
      assert.equal(res.statusCode, 200)
      assert.deepEqual(parsedBody, { 'value': value1 })
    }
    function validate4(res, parsedBody){
      assert.equal(res.statusCode, 200)
      assert.deepEqual(parsedBody, { 'value': value2 })
    }

    req = utils.prepare_post(obj_url, JSON.stringify(data), 'application/json')
    req1 = utils.prepare_post(obj_url, JSON.stringify(data1), 'application/json')
    req2 = utils.prepare_post(obj_url, JSON.stringify(data2), 'application/json')

    utils.send_post(req, utils.noop, function(){
      first_save = Date.now()
      sleep.sleep(1)

      utils.send_post(req1, utils.noop, function(){
        second_save = Date.now()
        sleep.sleep(1)

        utils.send_post(req2, utils.noop, function(){
          third_save = Date.now()

          // when specifying with a timestamp before the first call, a null value is returned
          utils.send_get(obj_url + `/${key}?timestamp=${first_save-500}`, validate1, function(){
            // when specifying with a timestamp between the first two calls, the first result is returned
            utils.send_get(obj_url + `/${key}?timestamp=${first_save+500}`, validate2, function(){
              // when specifying with a timestamp between 2nd and 3rd call, the second result is returned
              utils.send_get(obj_url + `/${key}?timestamp=${second_save+500}`, validate3, function(){
                // when specifying with a timestamp after the third call, the second result is returned
                utils.send_get(obj_url + `/${key}?timestamp=${third_save+500}`, validate4, done)
              })
            })
          })
        })
      })
    })
  })

})
