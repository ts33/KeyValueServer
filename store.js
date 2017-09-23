var check = require('check-types')


invalid_save_message = { 'error': 'input is invalid, please enter only a `key` of type String (alphanumeric and _ only) and a `value` of type String/JSON' }

invalid_get_message = { 'error': 'input is invalid, please enter only a `key` of type String (alphanumeric and _ only) with an optional `timestamp` of type unix timestamp' }

not_found_get_message = { 'error': 'no records found. Either this key does not have any records, no records existed with this timestamp'}

var kv_store = {}


function clone(obj){
  return JSON.parse(JSON.stringify(obj))
}


function save_inputs_valid(key, value){
  // only allow alphanumeric characters and underscore to be used in key
  if (check.match(key, /^[A-Za-z0-9_]+$/) && (check.object(value) || check.string(value))){
    return true
  } else {
    return false
  }
}


function save_inputs_invalid(key, value){
  return !save_inputs_valid(key, value)
}


function get_inputs_valid(key, timestamp){
  // only allow alphanumeric characters and underscore to be used in key
  if (check.match(key, /^[A-Za-z0-9_]+$/) && (check.maybe(timestamp) == true || check.positive(timestamp))){
    return true
  } else {
    return false
  }
}


function get_inputs_invalid(key, timestamp){
  return !get_inputs_valid(key, timestamp)
}


// saves key value information with timestamp as a form of version control
function save(key, value){

  if (save_inputs_invalid(key, value)){
    return invalid_save_message
  }

  record = { 'value': value, 'timestamp': Date.now() }

  if (key in kv_store) {
    kv_store[key].push(record)
  } else {
    kv_store[key] = [record]
  }

  resp = clone(record)
  resp['key'] = key
  return resp
}


// retrieves value of key, with timestamp as an optional parameter
function read(key, timestamp){

  if (get_inputs_invalid(key, timestamp)){
    return invalid_get_message
  }

  if (key in kv_store){
    records = kv_store[key]

    if (check.maybe(timestamp) == true){
      // get the latest record
      record = records.pop()
      return { 'value': record['value'] }
    } else {

      if (timestamp < records[0]['timestamp']){
        return not_found_get_message
      }
      for (var i = 1; i < records.length; ++i) {
        if (timestamp < records[i]['timestamp']){
          return { 'value': records[i-1]['value'] }
        }
      }
      if (records[records.length-1]['timestamp'] <= timestamp){
        return { 'value': records[records.length-1]['value'] }
      }
    }
  }

  return not_found_get_message
}


// resets all information in the database
function reset(){
  kv_store = {}
}



module.exports.save = save

module.exports.read = read

module.exports.reset = reset

module.exports.invalid_save_message = invalid_save_message

module.exports.invalid_get_message = invalid_get_message

module.exports.not_found_get_message = not_found_get_message
