var fs = require('fs');
var spdy = require('spdy');
var config = require('./../config/config.json');
const port = process.env.PORT || config.port;
var morgan = require('morgan');
var winston = require('./../config/winston');
var path = require('path');
var RateLimit = require('express-rate-limit');

var credentials = {
    key: fs.readFileSync('certs/key.pem'),
    cert: fs.readFileSync('certs/cert.pem'),
    ca: fs.readFileSync('certs/csr.pem'),
    spdy: {
        protocols: ['h2', 'spdy/3.1', 'http/1.1']
    },
    requestCert: false,
    rejectUnauthorized: false
};

var apiLimiter = new RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000,
    message:
        "Too many hits from this IP, please try again after 15 minutes."
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = process.env.TLS_FLAG || 0  // in testing mode set TLS_FLAG=0

var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var swaggerUi = require('swagger-ui-express');
var expressJwt = require('express-jwt');
var cookieParser = require('cookie-parser');
var helmet = require('helmet');
var cors = require('cors');
var RedisStore = require('connect-redis')(session);

if (config.redisUses) {
    var redisClient = require('redis').createClient(config.redisPort, config.redisHost);
} else {
    var redisClient = require('redis').createClient(config.redisIBM);
    redisClient.AUTH(config.redisPwIBM);
}

// app.use(apiLimiter); //  apply to all requests
app.use(cors({origin : "*"}));
app.use(helmet());
app.use(cookieParser());

redisClient.on('connect', function () {
    console.log('Redis client is now connected');
});

redisClient.on('error', function (err) {
    console.log('Redis client is not connected' + err);
});

var redisOptions = {
    client: redisClient,
    no_ready_check: true,
    ttl: 600,
    logErrors: true
};

app.use(session({
    cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 45 * 60 * 1000
    }, rolling: true, secret: config.secret, store: new RedisStore(redisOptions), resave: true, saveUninitialized: true
}));

app.use('/apiK', expressJwt({ secret: config.secret }).unless({ path: ['/api/user/login','/api/user/register','/api/product','/api/Images/Products','/api/Services',''] }));

var swaggerDocument = require('./../../doc/swagger.json');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../views'));

app.use(morgan('combined', { stream: winston.stream }));

app.use('/api/user', require('./user.routes'));
app.use('/api/users', require('./user.routes'));
app.use('/api/project', require('./project.routes'));
app.use('/api/product', require('./product.routes'));
app.use('/api/service', require('./services.routes'));
app.use('/api/ping', require('./pingService.routes'));
app.use('/api/flow', require('./flow.routes'));
app.use('/api/file', require('./file.routes'));
app.use('/api/accountdetails', require('./accountdetails.routes'));
app.use('/api/mappingdata', require('./sourceData.routes'));
app.use('/api/branch/',require('./branchLocator.routes'))

app.use('/api/file/upload_files', require('./fileUpload.routers'));

app.use('/api/casbin', require('./casbin.routes'));

app.use('/api/Images/', express.static(path.join(__dirname,'../../Images/')));
app.use('/api/Verification/', express.static(path.join(__dirname,'../../Verification/')));
app.use('/api/Confirmation/', express.static(path.join(__dirname,'../../Confirmation/')));

//Expose your swagger documentation through your express framework
app.use('/api-docs/v0.1', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/api-docs', function (req, res) {
    res.redirect('/api-docs/v0.1');
})

// error handler for logging using winston
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    if (!err.status) {
        err["status"] = 500;
        err["error"] = 'Internal server error.'
    }

    // add this line to include winston logging
    winston.error(`${err.status} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    // render the error page
    res.status(err.status);
    // next();
    res.status(err.status).send(err);
});


// var server = spdy.createServer(credentials, app);

var server = app.listen(config.port, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
// console.log("Server listening on https://", port);

module.exports = server
