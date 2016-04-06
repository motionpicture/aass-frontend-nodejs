var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('./modules/Logger');
var auth = require('./modules/Auth');
var session = require('./modules/Session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var conf = require('config');
var routes = require('./routes/index');

var app = express();

//メモリ計測的な
app.use(function (req, res, next) {
    logger.system.debug('start memoryUsage:', process.memoryUsage());
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));

app.use(logger.express);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// for parsing multipart/form-data
var storage = multer.memoryStorage()
app.use(multer({ storage: storage }).any());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/../public')));

app.use(session);
app.use(auth);

// ルーティングセット
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

//メモリ計測的な
app.use(function (req, res, next) {
    logger.system.debug('end memoryUsage:', process.memoryUsage());
    next();
});

module.exports = app;
