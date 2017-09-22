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
      assert.equal(store.save(key, value), expected);
    });

    test('should return error if value is not string/JSON', function() {
      key = 'abc'
      value = 123
      expected = store.invalid_save_message
      assert.equal(store.save(key, value), expected);
    });

    test('should return error if key is not string', function() {
      key = 123
      value = 'some_value'
      expected = store.invalid_save_message
      assert.equal(store.save(key, value), expected);
    });

  });

});


suite('Get', function() {

  suite('Valid inputs', function() {

    setup(function() {
      store.reset()
    });

    test('should accept string `key` and return string `value`', function() {
      key = 'abc'
      value = 'some_value'
      store.save(key, value)

      expected = { 'value': 'some_value' }
      assert.deepEqual(store.get('abc', null), expected);
    });

    test('should accept string `key` and return JSON `value`', function() {
      key = 'abc'
      value = {'inner_key':'def', 'inner_value':123}
      store.save(key, value)

      expected = { 'value': {'inner_key':'def', 'inner_value':123} }
      assert.deepEqual(store.get('abc', null), expected);
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
      assert.equal(store.get(123), expected);
    });

    test('should return error if timestamp is not int', function() {
      key = 'abc'
      value = 'some_value'
      store.save(key, value)

      expected = store.invalid_get_message
      assert.equal(store.get('abc', 'timestamp'), expected);
    });

    test('should return error if timestamp is negative or zero', function() {
      key = 'abc'
      value = 'some_value'
      store.save(key, value)

      expected = store.invalid_get_message
      assert.equal(store.get('abc', -100), expected);
      assert.equal(store.get('abc', 0), expected);
    });

  });

});


suite('Reset', function() {

    test('should empty all records', function() {
      key = 'abc'
      value = 'some_value'
      store.save(key, value)
      store.reset()

      assert.deepEqual(store.get('abc', null), null);
    });

});


suite('Advanced Get', function() {

  setup(function() {
    store.reset()
  });

  test('should return correct value', function() {
    key = 'abc'
    value = 'some_value'
    store.save(key, value)

    key = 'def'
    value = 'another_value'
    store.save(key, value)

    expected = { 'value': 'some_value' }
    assert.deepEqual(store.get('abc', null), expected);
  });

  test('should return updated value', function() {
    key = 'abc'
    value = 'some_value'
    store.save(key, value)

    key = 'abc'
    value = 'another_value'
    store.save(key, value)

    expected = { 'value': 'another_value' }
    assert.deepEqual(store.get('abc', null), expected);
  });

  test('should return values according to timestamp', function() {
      this.timeout(3000);
      key = 'abc'
      value = 'first_value'
      store.save(key, value)
      first_save = Date.now()

      sleep.sleep(1)
      key = 'abc'
      value = 'second_value'
      store.save(key, value)
      second_save = Date.now()

      sleep.sleep(1)
      key = 'abc'
      value = 'third_value'
      store.save(key, value)
      third_save = Date.now()

      // when specifying with a timestamp before the first call, a null value is returned
      assert.deepEqual(store.get('abc', first_save-500), null);

      expected = { 'value': 'first_value' }
      // when specifying with a timestamp between the first two calls, the first result is returned
      assert.deepEqual(store.get('abc', first_save+500), expected);

      expected = { 'value': 'second_value' }
      // when specifying with a timestamp between 2nd and 3rd call, the second result is returned
      assert.deepEqual(store.get('abc', second_save+500), expected);

      expected = { 'value': 'third_value' }
      // when specifying with a timestamp after the third call, the second result is returned
      assert.deepEqual(store.get('abc', third_save+500), expected);
  });

});
