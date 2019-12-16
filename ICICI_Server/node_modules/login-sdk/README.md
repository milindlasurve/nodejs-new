# Login Service
A microservice that can be used by other applications to perform all login operations for MongoDB.

## SDK for developers
The login-sdk helps developers to perform authentication operations on MongoDB for any application.

## Deployment
The project is hosted on GitHub. 

### Prerequisites
Make sure you have Node.js 8.9.0 or higher installed. If not, install it.

```sh
# Check your node version using this command
node --version
```
```sh
# Access the SDK using below command within the project directory
npm install login-sdk

# To save and install the SDK in your application package.json use below command within the project directory.
npm install -S login-sdk
```

## How to use login-sdk
```sh
var login = require('login-sdk');

# Create (Store data in MongoDB)
login.authenticate(<mongodb-connection-string>, <db-name>, <collection-name>, {username},{password}, function (err, data) {
            if (err) // do something
});
```