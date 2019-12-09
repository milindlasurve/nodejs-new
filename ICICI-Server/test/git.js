var Cryptr = require('cryptr'),
cryptr = new Cryptr('myTotalySecretKey');

var username = "akshay"

var ecryptedData  = cryptr.encrypt(username);
console.log("ecryptedData = > ",ecryptedData);

var decryptedData = cryptr.decrypt(ecryptedData)
console.log("decryptedData = > ",decryptedData);
