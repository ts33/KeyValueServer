# Description

Just a simple HTTP server that stores and retrieves key value information. The server can:

1. [POST]: Accept a key(string with characters limited to [A-Za-z0-9_) and value(some json blob/string) {"key" : "value"} and store them. If an existing key is sent, the value will be updated

2. [GET]: Accept a key and return the corresponding latest value

3. [GET]: When given a key AND a timestamp, return whatever the value of the key at the time was.


Example:

```
> curl -X POST -H 'Content-type:application/json' -d '{"key": "abc", "value": "some_value"}' 'http://localhost:3000/object'
> {"key":"abc", "value":"some_value", "timestamp": time}
```
Where time is timestamp of the post request (6.00pm)

```
> curl -X GET 'http://localhost:3000/object/abc'
> {"value":"some_value"}
```

```
> curl -X POST -H 'Content-type:application/json' -d '{"key": "abc", "value": "new_value"}' 'http://localhost:3000/object'
> {"key":"abc", "value":"some_value", "timestamp": time}
```
Where time is timestamp of the new value (6.05pm)

```
> curl -X GET 'http://localhost:3000/object/abc'
> {"value":"new_value"}
```

```
> curl -X GET 'http://localhost:3000/object/abc?timestamp=1440568980'
> {"value":"some_value"}
```
the first value is still returned, because the new value was only added at 6:05pm.
1440568980 is at 6.03pm


# Commands
- npm install
- DATABASE_URL={postgres_connection_string} npm start
- DATABASE_URL={postgres_connection_string} URL=http://localhost:3000 npm test
- URL=http://localhost:3000 npm run-script test-integration
- npm run-script report
