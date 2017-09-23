let check = require('check-types');


invalidSaveMessage = {'error': 'input is invalid, please enter only a `key` of type String (alphanumeric and _ only) and a `value` of type String/JSON'};

invalidGetMessage = {'error': 'input is invalid, please enter only a `key` of type String (alphanumeric and _ only) with an optional `timestamp` of type unix timestamp'};

notFoundGetMessage = {'error': 'no records found. Either this key does not have any records, no records existed with this timestamp'};

let kvStore = {};


function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}


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
function save(key, value) {
  if (saveInputsInvalid(key, value)) {
    return invalidSaveMessage;
  }

  record = {'value': value, 'timestamp': Date.now()};

  if (key in kvStore) {
    kvStore[key].push(record);
  } else {
    kvStore[key] = [record];
  }

  resp = clone(record);
  resp['key'] = key;
  return resp;
}


// retrieves value of key, with timestamp as an optional parameter
function read(key, timestamp) {
  if (getInputsInvalid(key, timestamp)) {
    return invalidGetMessage;
  }

  if (key in kvStore) {
    records = kvStore[key];

    if (check.maybe(timestamp) == true) {
      // get the latest record
      record = records.pop();
      return {'value': record['value']};
    } else {
      if (timestamp < records[0]['timestamp']) {
        return notFoundGetMessage;
      }
      for (let i = 1; i < records.length; ++i) {
        if (timestamp < records[i]['timestamp']) {
          return {'value': records[i-1]['value']};
        }
      }
      if (records[records.length-1]['timestamp'] <= timestamp) {
        return {'value': records[records.length-1]['value']};
      }
    }
  }

  return notFoundGetMessage;
}


// resets all information in the database
function reset() {
  kvStore = {};
}


module.exports.save = save;

module.exports.read = read;

module.exports.reset = reset;

module.exports.invalidSaveMessage = invalidSaveMessage;

module.exports.invalidGetMessage = invalidGetMessage;

module.exports.notFoundGetMessage = notFoundGetMessage;
