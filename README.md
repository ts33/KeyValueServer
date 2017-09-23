#Description

Just a simple HTTP server that stores and retrieves key value information. The server can:

1. [POST]: Accept a key(string with characters limited to [A-Za-z0-9_) and value(some json blob/string) {"key" : "value"} and store them. If an existing key is sent, the value should be updated

2. [GET]: Accept a key and return the corresponding latest value

3. [GET]: When given a key AND a timestamp, return whatever the value of the key at the time was.




Example:

Method: POST

Endpoint: /object

Body: JSON: {mykey : value1}

Time: 6.00 pm

Response: {"key":"mykey", "value":"value1", "timestamp": time } //Where time is timestamp of the post request (6.00pm) .

------

Method: GET 

Endpoint: /object/mykey

Response: {"value": value1 } 

------

Method: POST

Endpoint: /object

Body: JSON: {mykey : value2}

Time: 6.05 pm

Response: {"key":"mykey", "value":"value2", "timestamp": time } //Where time is timestamp of the new value (6.05pm) .


------

Method: GET 

Endpoint: /object/mykey

Response: {"value": value2 }

------

Method: GET 

Endpoint: /object/mykey?timestamp=1440568980 [6.03pm] // the time here is not exactly 6.00pm

Response: {"value": value1 } // still return value 1 , because value 2 was only added at 6.05pm



#Commands
- npm install
- npm start
- URL=http://localhost:3000 npm test
- URL=http://localhost:3000 npm run-script test-integration
- npm run-script report