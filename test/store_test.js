var sleep = require('sleep');
var chai = require('chai');
var assert = chai.assert;
var store = require('../store.js');



suite('Save', function() {

  suite('Valid inputs', function() {

    setup(function() {
      store.reset()
    });

    test('should accept and return string `value`', function() {
      key = 'abc'
      value = 'some_value'
      ts = Date.now()
      result = store.save(key, value)
      diff = result['timestamp'] - ts

      assert.equal(result['key'], key)
      assert.equal(result['value'], value)
      assert.isBelow(diff, 5)
    });

    test('should accept and return JSON `value`', function() {
      key = 'abc'
      value = {'inner_key':'def', 'inner_value':123}
      ts = Date.now()
      result = store.save(key, value)
      diff = result['timestamp'] - ts

      assert.equal(result['key'], key)
      assert.deepEqual(result['value'], value)
      assert.isBelow(diff, 5)
    });

  });

  suite('Invalid inputs', function(){

    setup(function() {
      store.reset()
    });

    test('should return error if key is empty string', function() {
      key = ''
      value = 'some_value'
      expected = store.invalid_save_message
      assert.deepEqual(store.save(key, value), expected);
    });

    test('should return error if value is not string/JSON', function() {
      key = 'abc'
      value = 123
      expected = store.invalid_save_message
      assert.deepEqual(store.save(key, value), expected);
    });

    test('should return error if key is not string', function() {
      key = 123
      value = 'some_value'
      expected = store.invalid_save_message
      assert.deepEqual(store.save(key, value), expected);
    });

  });

});


suite('Read', function() {

  suite('Valid inputs', function() {

    setup(function() {
      store.reset()
    });

    test('should accept string `key` and return string `value`', function() {
      key = 'abc'
      value = 'some_value'
      store.save(key, value)

      expected = { 'value': value }
      assert.deepEqual(store.read(key, null), expected);
    });

    test('should accept string `key` and return JSON `value`', function() {
      key = 'abc'
      value = {'inner_key':'def', 'inner_value':123}
      store.save(key, value)

      expected = { 'value': value }
      assert.deepEqual(store.read(key, null), expected);
    });

  });

  suite('Invalid inputs', function(){

    setup(function() {
      store.reset()
    });

    test('should return error if key is not string/JSON', function() {
      key = 'abc'
      value = 'some_value'
      store.save(key, value)

      expected = store.invalid_get_message
      assert.deepEqual(store.read(123), expected);
    });

    test('should return error if timestamp is not int', function() {
      key = 'abc'
      value = 'some_value'
      store.save(key, value)

      expected = store.invalid_get_message
      assert.deepEqual(store.read(key, 'timestamp'), expected);
    });

    test('should return error if timestamp is negative or zero', function() {
      key = 'abc'
      value = 'some_value'
      store.save(key, value)

      expected = store.invalid_get_message
      assert.deepEqual(store.read(key, -100), expected);
      assert.deepEqual(store.read(key, 0), expected);
    });

  });

});


suite('Reset', function() {

    test('should empty all records', function() {
      key = 'abc'
      value = 'some_value'
      store.save(key, value)
      store.reset()

      assert.deepEqual(store.read(key, null), store.not_found_get_message);
    });

});


suite('Advanced Read', function() {

  setup(function() {
    store.reset()
  });

  test('should return correct value', function() {
    key = 'abc'
    value = 'some_value'
    store.save(key, value)

    key2 = 'def'
    value2 = 'another_value'
    store.save(key2, value2)

    expected = { 'value': value }
    assert.deepEqual(store.read(key, null), expected);
  });

  test('should return updated value', function() {
    key = 'abc'
    value = 'some_value'
    store.save(key, value)

    key = 'abc'
    value2 = 'another_value'
    store.save(key, value2)

    expected = { 'value': value2 }
    assert.deepEqual(store.read(key, null), expected);
  });

  test('should return values according to timestamp', function() {
      this.timeout(3000);
      key = 'abc'
      value = 'first_value'
      store.save(key, value)
      first_save = Date.now()

      sleep.sleep(1)
      key = 'abc'
      value1 = 'second_value'
      store.save(key, value1)
      second_save = Date.now()

      sleep.sleep(1)
      key = 'abc'
      value2 = 'third_value'
      store.save(key, value2)
      third_save = Date.now()

      // when specifying with a timestamp before the first call, a null value is returned
      assert.deepEqual(store.read(key, first_save-500), store.not_found_get_message);

      expected = { 'value': value }
      // when specifying with a timestamp between the first two calls, the first result is returned
      assert.deepEqual(store.read(key, first_save+500), expected);

      expected = { 'value': value1 }
      // when specifying with a timestamp between 2nd and 3rd call, the second result is returned
      assert.deepEqual(store.read(key, second_save+500), expected);

      expected = { 'value': value2 }
      // when specifying with a timestamp after the third call, the second result is returned
      assert.deepEqual(store.read(key, third_save+500), expected);
  });

});
