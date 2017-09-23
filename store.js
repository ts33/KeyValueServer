let check = require('check-types');
let sqlCommands = require('./sql_commands.js');


invalidSaveMessage = {'error': 'input is invalid, please enter only a `key` of type String (alphanumeric and _ only) and a `value` of type String/JSON'};

invalidGetMessage = {'error': 'input is invalid, please enter only a `key` of type String (alphanumeric and _ only) with an optional `timestamp` of type unix timestamp'};

notFoundGetMessage = {'error': 'no records found. Either this key does not have any records, no records existed with this timestamp'};


// https://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try
function tryParseJson(possibleJsonString) {
  try {
    let o = JSON.parse(possibleJsonString);
    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns null, and typeof null === "object",
    // so we must check for that, too. Thankfully, null is falsey, so this suffices:
    if (o && typeof o === 'object') {
        return o;
    }
  } catch (e) {
  }

  return possibleJsonString;
};


function saveInputsValid(key, value) {
  // only allow alphanumeric characters and underscore to be used in key
  if (check.match(key, /^[A-Za-z0-9_]+$/) &&
    (check.object(value) || check.string(value))) {
    return true;
  } else {
    return false;
  }
}


function saveInputsInvalid(key, value) {
  return !saveInputsValid(key, value);
}


function getInputsValid(key, timestamp) {
  // only allow alphanumeric characters and underscore to be used in key
  if (check.match(key, /^[A-Za-z0-9_]+$/) &&
    (check.maybe(timestamp) == true || check.positive(timestamp))) {
    return true;
  } else {
    return false;
  }
}


function getInputsInvalid(key, timestamp) {
  return !getInputsValid(key, timestamp);
}


// saves key value information with timestamp as a form of version control
function save(pool, key, value, callback) {
  if (saveInputsInvalid(key, value)) {
    callback(invalidSaveMessage);
  } else {
    if (check.object(value)) {
      value = JSON.stringify(value);
    }
    pool.query(sqlCommands.addKvRow, [key, value], (err, res) => {
      if (err) {
        console.log(err.stack);
      } else {
        record = res.rows[0];
        record['timestamp'] = record['timestamp'] * 1000;
        record['value'] = tryParseJson(record['value']);
        callback(record);
      }
    });
  }
}


// retrieves value of key, with timestamp as an optional parameter
function read(pool, key, timestamp, callback) {
  if (getInputsInvalid(key, timestamp)) {
    callback(invalidGetMessage);
  } else {
    // if timestamp is undefined or null, set it to a future time to guarantee that the latest record will be retrieved
    if (check.maybe(timestamp) == true) {
      timestamp = Date.now(0) + 500000;
    };
    timestamp = timestamp / 1000;

    pool.query(sqlCommands.getLatestFromKvTable, [key, timestamp], (err, res) => {
      if (err) {
        console.log(err.stack);
      } else {
        record = res.rows[0];
        // return error message if no results found
        if (check.maybe(record) == true) {
          callback(notFoundGetMessage);
        } else {
          record['value'] = tryParseJson(record['value']);
          callback(record);
        }
      }
    });
  }
}


// resets all information in the database
function reset(pool, callback) {
  pool.query(sqlCommands.deleteKvRows, (err, res) => {
    if (err) {
      console.log(err.stack);
    }
    callback();
  });
}


module.exports.save = save;

module.exports.read = read;

module.exports.reset = reset;

module.exports.invalidSaveMessage = invalidSaveMessage;

module.exports.invalidGetMessage = invalidGetMessage;

module.exports.notFoundGetMessage = notFoundGetMessage;
