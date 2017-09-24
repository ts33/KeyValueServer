let async = require('async');
let sleep = require('sleep');
let chai = require('chai');
let assert = chai.assert;
let store = require('../store.js');
const {Pool} = require('pg');
let dbHelper = require('../db_helper.js');


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

pool.query(dbHelper.createKvTable, (err, res) => {
  if (err) {
    console.log(err.stack);
  }
});


suite('Save', function() {
  suite('Valid inputs', function() {
    setup(function(done) {
      store.reset(pool, done);
    });

    test('should accept and return string `value`', function(done) {
      key = 'a_bc';
      value = 'some_value';
      ts = Date.now();
      store.save(pool, key, value, function(err, result) {
        diff = result['timestamp'] - ts;
        assert.equal(result['key'], key);
        assert.equal(result['value'], value);
        assert.isBelow(diff, 5);
        done();
      });
    });

    test('should accept and return JSON `value`', function(done) {
      key = 'abc';
      value = {'inner_key': 'def', 'inner_value': 123};
      ts = Date.now();
      store.save(pool, key, value, function(err, result) {
        diff = result['timestamp'] - ts;
        assert.equal(result['key'], key);
        assert.deepEqual(result['value'], value);
        assert.isBelow(diff, 5);
        done();
      });
    });
  });

  suite('Invalid inputs', function() {
    setup(function(done) {
      store.reset(pool, done);
    });

    test('should return error if key is empty string', function(done) {
      key = '';
      value = 'some_value';
      expected = store.invalidSaveMessage;
      store.save(pool, key, value, function(err, result) {
        assert.deepEqual(result, expected);
        done();
      });
    });

    test('should return error if value is not string/JSON', function(done) {
      key = 'abc';
      value = 123;
      expected = store.invalidSaveMessage;
      store.save(pool, key, value, function(err, result) {
        assert.deepEqual(result, expected);
        done();
      });
    });

    test('should return error if key is not string', function(done) {
      key = 123;
      value = 'some_value';
      expected = store.invalidSaveMessage;
      store.save(pool, key, value, function(err, result) {
        assert.deepEqual(result, expected);
        done();
      });
    });

    test('should return error if key has characters that are not alphanumeric or _', function(done) {
      value = 'some_value';
      expected = store.invalidSaveMessage;

      async.waterfall([
        function(callback) {
          store.save(pool, 'ab-', value, callback);
        },
        function(result, callback) {
          assert.deepEqual(result, expected);
          callback();
        },
        function(callback) {
          store.save(pool, 'ab.', value, callback);
        },
        function(result, callback) {
          assert.deepEqual(result, expected);
          callback();
        },
        function(callback) {
          store.save(pool, 'ab@', value, callback);
        },
        function(result, callback) {
          assert.deepEqual(result, expected);
          done();
        },
      ]);
    });
  });
});


suite('Read', function() {
  suite('Valid inputs', function() {
    setup(function(done) {
      store.reset(pool, done);
    });

    test('should accept string `key` and return string `value`', function(done) {
      key = 'abc';
      value = 'some_value';
      expected = {'value': value};

      store.save(pool, key, value, function(err, result) {
        store.read(pool, key, null, function(err, result) {
          assert.deepEqual(result, expected);
          done();
        });
      });
    });

    test('should accept string `key` and return JSON `value`', function(done) {
      key = 'abc';
      value = {'inner_key': 'def', 'inner_value': 123};
      expected = {'value': value};

      store.save(pool, key, value, function(err, result) {
        store.read(pool, key, null, function(err, result) {
          assert.deepEqual(result, expected);
          done();
        });
      });
    });
  });

  suite('Invalid inputs', function() {
    setup(function(done) {
      store.reset(pool, done);
    });

    test('should return error if key is not string', function(done) {
      key = 'abc';
      value = 'some_value';
      expected = store.invalidGetMessage;

      store.save(pool, key, value, function(err, result) {
        store.read(pool, 123, null, function(err, result) {
          assert.deepEqual(result, expected);
          done();
        });
      });
    });

    test('should return error if key has characters that are not alphanumeric or _', function(done) {
      key = 'abc';
      value = 'some_value';
      expected = store.invalidGetMessage;

      async.waterfall([
        function(callback) {
          store.save(pool, key, value, callback);
        },
        function(result, callback) {
          store.read(pool, 'ab-', null, callback);
        },
        function(result, callback) {
          assert.deepEqual(result, expected);
          callback();
        },
        function(callback) {
          store.read(pool, 'ab.', null, callback);
        },
        function(result, callback) {
          assert.deepEqual(result, expected);
          callback();
        },
        function(callback) {
          store.read(pool, 'ab@', null, callback);
        },
        function(result, callback) {
          assert.deepEqual(result, expected);
          done();
        },
      ]);
    });

    test('should return error if timestamp is not int', function(done) {
      key = 'abc';
      value = 'some_value';
      expected = store.invalidGetMessage;

      store.save(pool, key, value, function(err, result) {
        store.read(pool, key, 'timestamp', function(err, result) {
          assert.deepEqual(result, expected);
          done();
        });
      });
    });

    test('should return error if timestamp is negative or zero', function(done) {
      key = 'abc';
      value = 'some_value';
      expected = store.invalidGetMessage;

      async.waterfall([
        function(callback) {
          store.save(pool, key, value, callback);
        },
        function(result, callback) {
          store.read(pool, -100, null, callback);
        },
        function(result, callback) {
          assert.deepEqual(result, expected);
          callback();
        },
        function(callback) {
          store.read(pool, 0, null, callback);
        },
        function(result, callback) {
          assert.deepEqual(result, expected);
          done();
        },
      ]);
    });
  });
});


suite('Reset', function() {
  test('should empty all records', function(done) {
    key = 'abc';
    value = 'some_value';

    async.waterfall([
      function(callback) {
        store.save(pool, key, value, callback);
      },
      function(result, callback) {
        store.reset(pool, callback);
      },
      function(callback) {
        store.read(pool, key, null, callback);
      },
      function(result, callback) {
        assert.deepEqual(result, store.notFoundGetMessage);
        done();
      },
    ]);
  });
});


suite('Advanced Read', function() {
  setup(function(done) {
    store.reset(pool, done);
  });

  test('should return correct value', function(done) {
    key = 'abc';
    value = 'some_value';
    key2 = 'def';
    value2 = 'another_value';
    expected = {'value': value};

    async.waterfall([
      function(callback) {
        store.save(pool, key, value, callback);
      },
      function(result, callback) {
        store.save(pool, key2, value2, callback);
      },
      function(result, callback) {
        store.read(pool, key, null, callback);
      },
      function(result, callback) {
        assert.deepEqual(result, expected);
        done();
      },
    ]);
  });

  test('should return updated value', function(done) {
    key = 'abc';
    value = 'some_value';
    value2 = 'another_value';
    expected = {'value': value2};

    async.waterfall([
      function(callback) {
        store.save(pool, key, value, callback);
      },
      function(result, callback) {
        store.save(pool, key, value2, callback);
      },
      function(result, callback) {
        store.read(pool, key, null, callback);
      },
      function(result, callback) {
        assert.deepEqual(result, expected);
        done();
      },
    ]);
  });

  test('should return values according to timestamp', function(done) {
    key = 'abc';
    value = 'first_value';
    value1 = 'second_value';
    value2 = 'third_value';
    expected = {'value': value};
    expected1 = {'value': value1};
    expected2 = {'value': value2};

    async.waterfall([
      function(callback) {
        store.save(pool, key, value, callback);
      },
      function(result, callback) {
        firstSave = Date.now();
        sleep.sleep(1);
        store.save(pool, key, value1, callback);
      },
      function(result, callback) {
        secondSave = Date.now();
        sleep.sleep(1);
        store.save(pool, key, value2, callback);
      },
      function(result, callback) {
        thirdSave = Date.now();
        // when specifying with a timestamp before the first call, a null value is returned
        store.read(pool, key, firstSave-500, callback);
      },
      function(result, callback) {
        assert.deepEqual(result, store.notFoundGetMessage);
        // when specifying with a timestamp between the first two calls, the first result is returned
        store.read(pool, key, firstSave+500, callback);
      },
      function(result, callback) {
        assert.deepEqual(result, expected);
        // when specifying with a timestamp between 2nd and 3rd call, the second result is returned
        store.read(pool, key, secondSave+500, callback);
      },
      function(result, callback) {
        assert.deepEqual(result, expected1);
        // when specifying with a timestamp after the third call, the second result is returned
        store.read(pool, key, thirdSave+500, callback);
      },
      function(result, callback) {
        assert.deepEqual(result, expected2);
        done();
      },
    ]);
  });
});
