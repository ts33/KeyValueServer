const {Pool} = require('pg');


function connectDb() {
   return new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: true,
   });
}


function setupDb(pool, callback) {
  pgQuery(pool, createKvTable, null, function(record) {
    callback();
  });
}


function pgQuery(pool, command, values, callback) {
  pool.query(command, values, (err, res) => {
    if (err) {
      console.log(err.stack);
    }
    callback(res.rows[0]);
  });
}


function millisecondsToSeconds(milli) {
  return milli / 1000;
}


function secondsToMilliseconds(sec) {
  return sec * 1000;
}


let createKvTable = 'CREATE TABLE IF NOT EXISTS key_value ('+
  'key varchar(25) NOT NULL,'+
  'value varchar(100),'+
  'ts timestamp without time zone default (now() at time zone \'utc\'),'+
  'PRIMARY KEY (key, ts)'+
  ');';

let deleteKvRows = 'DELETE FROM key_value;';

let getLatestFromKvTable = 'SELECT value FROM key_value '+
  'WHERE key = $1 AND extract(epoch from ts) < $2 '+
  'ORDER BY ts DESC LIMIT 1;';

let addKvRow = 'INSERT INTO key_value(key, value) '+
  'VALUES($1, $2) '+
  'RETURNING key, value, extract(epoch from ts) as timestamp;';


module.exports.createKvTable = createKvTable;

module.exports.deleteKvRows = deleteKvRows;

module.exports.getLatestFromKvTable = getLatestFromKvTable;

module.exports.addKvRow = addKvRow;

module.exports.pgQuery = pgQuery;

module.exports.millisecondsToSeconds = millisecondsToSeconds;

module.exports.secondsToMilliseconds = secondsToMilliseconds;

module.exports.connectDb = connectDb;

module.exports.setupDb = setupDb;
