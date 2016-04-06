"use strict";

var express = require('express');
var logger = require('../modules/logger');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.redirect('/medias');
});

router.get('/scaleOutTest', function(req, res, next) {
});

module.exports = router;
