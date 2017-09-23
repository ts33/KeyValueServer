let async = require('async');
let sleep = require('sleep');
let chai = require('chai');
let assert = chai.assert;
let store = require('../store.js');
let utils = require('./utils.js');


const objUrl = utils.baseUrl + '/object';


suite('/object Post', function() {
  suite('Valid inputs', function() {
    setup(function(done) {
      utils.resetDb(done);
    });

    test('should accept and return string `value`', function(done) {
      key = 'a_bc';
      value = 'some_value';
      data = {'key': key, 'value': value};
      ts = Date.now();

      function validate(res, parsedBody) {
        assert.equal(res.statusCode, 200);
        assert.equal(parsedBody['key'], key);
        assert.equal(parsedBody['value'], value);

        diff = parsedBody['timestamp'] - ts;
        assert.isBelow(diff, 1000);
      }

      req = utils.preparePost(objUrl, JSON.stringify(data), 'application/json');
      utils.sendPost(req, validate, done);
    });

    test('should accept and return JSON `value`', function(done) {
      key = 'abc';
      value = {'inner_key': 'def', 'inner_value': 123};
      data = {'key': key, 'value': value};
      ts = Date.now();

      function validate(res, parsedBody) {
        assert.equal(res.statusCode, 200);
        assert.equal(parsedBody['key'], key);
        assert.deepEqual(parsedBody['value'], value);

        diff = parsedBody['timestamp'] - ts;
        assert.isBelow(diff, 1000);
      }

      req = utils.preparePost(objUrl, JSON.stringify(data), 'application/json');
      utils.sendPost(req, validate, done);
    });
  });

  suite('Invalid inputs', function() {
    setup(function(done) {
      utils.resetDb(done);
    });

    test('should return error if data is not JSON', function(done) {
      data = '123';

      function validate(res, parsedBody) {
        assert.equal(res.statusCode, 400);
        assert.deepEqual(parsedBody, store.invalidSaveMessage);
      }

      req = utils.preparePost(objUrl, data, 'plain/text');
      utils.sendPost(req, validate, done);
    });

    test('should return error if key is empty string', function(done) {
      key = '';
      value = 'some_value';
      data = {'key': key, 'value': value};

      function validate(res, parsedBody) {
        assert.equal(res.statusCode, 400);
        assert.deepEqual(parsedBody, store.invalidSaveMessage);
      }

      req = utils.preparePost(objUrl, JSON.stringify(data), 'application/json');
      utils.sendPost(req, validate, done);
    });

    test('should return error if value is not string/JSON', function(done) {
      key = 'abc';
      value = 123;
      data = {'key': key, 'value': value};

      function validate(res, parsedBody) {
        assert.equal(res.statusCode, 400);
        assert.deepEqual(parsedBody, store.invalidSaveMessage);
      }

      req = utils.preparePost(objUrl, JSON.stringify(data), 'application/json');
      utils.sendPost(req, validate, done);
    });

    test('should return error if key is not string', function(done) {
      key = 123;
      value = 'some_value';
      data = {'key': key, 'value': value};

      function validate(res, parsedBody) {
        assert.equal(res.statusCode, 400);
        assert.deepEqual(parsedBody, store.invalidSaveMessage);
      }

      req = utils.preparePost(objUrl, JSON.stringify(data), 'application/json');
      utils.sendPost(req, validate, done);
    });

    test('should return error if key has characters that are not alphanumeric or _', function(done) {
      value = 'some_value';
      data1 = {'key': 'ab-', 'value': value};
      data2 = {'key': 'ab.', 'value': value};
      data3 = {'key': 'ab@', 'value': value};

      function validate(res, parsedBody) {
        assert.equal(res.statusCode, 400);
        assert.deepEqual(parsedBody, store.invalidSaveMessage);
      }

      req1 = utils.preparePost(objUrl, JSON.stringify(data1), 'application/json');
      req2 = utils.preparePost(objUrl, JSON.stringify(data2), 'application/json');
      req3 = utils.preparePost(objUrl, JSON.stringify(data3), 'application/json');

      async.series([
        function(callback) {
          utils.sendPost(req1, validate, callback);
        },
        function(callback) {
          utils.sendPost(req2, validate, callback);
        },
        function(callback) {
          utils.sendPost(req3, validate, done);
        },
      ]);
    });
  });
});


suite('/object/:key Get', function() {
  suite('Valid inputs', function() {
    setup(function(done) {
      utils.resetDb(done);
    });

    test('should accept string `key` and return string `value`', function(done) {
      key = 'abc';
      value = 'some_value';
      data = {'key': key, 'value': value};
      expected = {'value': value};

      function validate(res, parsedBody) {
        assert.equal(res.statusCode, 200);
        assert.deepEqual(parsedBody, expected);
      }

      req = utils.preparePost(objUrl, JSON.stringify(data), 'application/json');
      utils.sendPost(req, utils.noop, function() {
        utils.sendGet(objUrl + `/${key}`, validate, done);
      });
    });

    test('should accept string `key` and return JSON `value`', function(done) {
      key = 'abc';
      value = {'inner_key': 'def', 'inner_value': 123};
      data = {'key': key, 'value': value};
      expected = {'value': value};

      function validate(res, parsedBody) {
        assert.equal(res.statusCode, 200);
        assert.deepEqual(parsedBody, expected);
      }

      req = utils.preparePost(objUrl, JSON.stringify(data), 'application/json');
      utils.sendPost(req, utils.noop, function() {
        utils.sendGet(objUrl + `/${key}`, validate, done);
      });
    });
  });

  suite('Invalid inputs', function() {
    setup(function(done) {
      utils.resetDb(done);
    });

    test('should return error if key is not valid', function(done) {
      key = 'abc';
      value = 'some_value';
      data = {'key': key, 'value': value};
      expected = store.notFoundGetMessage;

      function validate(res, parsedBody) {
        assert.equal(res.statusCode, 400);
        assert.deepEqual(parsedBody, expected);
      }

      req = utils.preparePost(objUrl, JSON.stringify(data), 'application/json');
      utils.sendPost(req, utils.noop, function() {
        utils.sendGet(objUrl + '/123', validate, done);
      });
    });

    test('should return error if key has characters that are not alphanumeric or _', function(done) {
      key = 'abc';
      value = 'some_value';
      data = {'key': key, 'value': value};
      expected = store.invalidGetMessage;

      function validate(res, parsedBody) {
        assert.equal(res.statusCode, 400);
        assert.deepEqual(parsedBody, expected);
      }

      req = utils.preparePost(objUrl, JSON.stringify(data), 'application/json');

      async.series([
        function(callback) {
          utils.sendPost(req, utils.noop, callback);
        },
        function(callback) {
          utils.sendGet(objUrl + '/ab-', validate, callback);
        },
        function(callback) {
          utils.sendGet(objUrl + '/ab.', validate, callback);
        },
        function(callback) {
          utils.sendGet(objUrl + '/ab@', validate, done);
        },
      ]);
    });

    test('should return error if timestamp is not int', function(done) {
      key = 'abc';
      value = 'some_value';
      data = {'key': key, 'value': value};
      expected = store.invalidGetMessage;

      function validate(res, parsedBody) {
        assert.equal(res.statusCode, 400);
        assert.deepEqual(parsedBody, expected);
      }

      req = utils.preparePost(objUrl, JSON.stringify(data), 'application/json');
      utils.sendPost(req, utils.noop, function() {
        utils.sendGet(objUrl + `/${key}?timestamp=timestamp`, validate, done);
      });
    });

    test('should return error if timestamp is negative or zero', function(done) {
      key = 'abc';
      value = 'some_value';
      data = {'key': key, 'value': value};
      expected = store.invalidGetMessage;

      function validate(res, parsedBody) {
        assert.equal(res.statusCode, 400);
        assert.deepEqual(parsedBody, expected);
      }

      req = utils.preparePost(objUrl, JSON.stringify(data), 'application/json');

      async.series([
        function(callback) {
          utils.sendPost(req, utils.noop, callback);
        },
        function(callback) {
          utils.sendGet(objUrl + `/${key}?timestamp=-100`, validate, callback);
        },
        function(callback) {
          utils.sendGet(objUrl + `/${key}?timestamp=0`, validate, done);
        },
      ]);
    });
  });
});


suite('/reset Get', function() {
  test('should empty all records', function(done) {
    key = 'abc';
    value = 'some_value';
    data = {'key': key, 'value': value};
    expected = store.notFoundGetMessage;

    function validate(res, parsedBody) {
      assert.equal(res.statusCode, 400);
      assert.deepEqual(parsedBody, expected);
    }

    req = utils.preparePost(objUrl, JSON.stringify(data), 'application/json');

    async.series([
      function(callback) {
        utils.sendPost(req, utils.noop, callback);
      },
      function(callback) {
        utils.resetDb(callback);
      },
      function(callback) {
        utils.sendGet(objUrl + `/${key}`, validate, done);
      },
    ]);
  });
});


suite('/object/:key Advanced Get', function() {
  setup(function(done) {
    utils.resetDb(done);
  });

  test('should return correct value', function(done) {
    key = 'abc';
    value = 'some_value';
    data = {'key': key, 'value': value};
    expected = {'value': value};

    key2 = 'def';
    value2 = 'another_value';
    data2 = {'key': key2, 'value': value2};

    function validate(res, parsedBody) {
      assert.equal(res.statusCode, 200);
      assert.deepEqual(parsedBody, expected);
    }

    req = utils.preparePost(objUrl, JSON.stringify(data), 'application/json');
    req2 = utils.preparePost(objUrl, JSON.stringify(data2), 'application/json');

    async.series([
      function(callback) {
        utils.sendPost(req, utils.noop, callback);
      },
      function(callback) {
        utils.sendPost(req2, utils.noop, callback);
      },
      function(callback) {
        utils.sendGet(objUrl + `/${key}`, validate, done);
      },
    ]);
  });

  test('should return updated value', function(done) {
    key = 'abc';
    value = 'some_value';
    data = {'key': key, 'value': value};

    value2 = 'another_value';
    data2 = {'key': key, 'value': value2};

    expected = {'value': value2};
    function validate(res, parsedBody) {
      assert.equal(res.statusCode, 200);
      assert.deepEqual(parsedBody, expected);
    }

    req = utils.preparePost(objUrl, JSON.stringify(data), 'application/json');
    req2 = utils.preparePost(objUrl, JSON.stringify(data2), 'application/json');

    async.series([
      function(callback) {
        utils.sendPost(req, utils.noop, callback);
      },
      function(callback) {
        utils.sendPost(req2, utils.noop, callback);
      },
      function(callback) {
        utils.sendGet(objUrl + `/${key}`, validate, done);
      },
    ]);
  });

  test('should return values according to timestamp', function(done) {
    key = 'abc';
    value = 'first_value';
    value1 = 'second_value';
    value2 = 'third_value';
    data = {'key': key, 'value': value};
    data1 = {'key': key, 'value': value1};
    data2 = {'key': key, 'value': value2};

    function validate1(res, parsedBody) {
      assert.equal(res.statusCode, 400);
      assert.deepEqual(parsedBody, store.notFoundGetMessage);
    }
    function validate2(res, parsedBody) {
      assert.equal(res.statusCode, 200);
      assert.deepEqual(parsedBody, {'value': value});
    }
    function validate3(res, parsedBody) {
      assert.equal(res.statusCode, 200);
      assert.deepEqual(parsedBody, {'value': value1});
    }
    function validate4(res, parsedBody) {
      assert.equal(res.statusCode, 200);
      assert.deepEqual(parsedBody, {'value': value2});
    }

    req = utils.preparePost(objUrl, JSON.stringify(data), 'application/json');
    req1 = utils.preparePost(objUrl, JSON.stringify(data1), 'application/json');
    req2 = utils.preparePost(objUrl, JSON.stringify(data2), 'application/json');

    async.series([
      function(callback) {
        utils.sendPost(req, utils.noop, callback);
      },
      function(callback) {
        firstSave = Date.now();
        sleep.sleep(1);
        utils.sendPost(req1, utils.noop, callback);
      },
      function(callback) {
        secondSave = Date.now();
        sleep.sleep(1);
        utils.sendPost(req2, utils.noop, callback);
      },
      function(callback) {
        thirdSave = Date.now();
        // when specifying with a timestamp before the first call, a null value is returned
        utils.sendGet(objUrl + `/${key}?timestamp=${firstSave-500}`, validate1, callback);
      },
      // when specifying with a timestamp between the first two calls, the first result is returned
      function(callback) {
        utils.sendGet(objUrl + `/${key}?timestamp=${firstSave+500}`, validate2, callback);
      },
      // when specifying with a timestamp between 2nd and 3rd call, the second result is returned
      function(callback) {
        utils.sendGet(objUrl + `/${key}?timestamp=${secondSave+500}`, validate3, callback);
      },
      // when specifying with a timestamp after the third call, the second result is returned
      function(callback) {
        utils.sendGet(objUrl + `/${key}?timestamp=${thirdSave+500}`, validate4, done);
      },
    ]);
  });
});
