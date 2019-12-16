var config = require('../config/config.json');
var isDebug = config.isDebug;

exports.log = function (key,value){
   
   if(isDebug){
       console.log(key,value);
   }
}