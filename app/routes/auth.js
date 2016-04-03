var express = require('express');
var logger = require('../modules/logger');
var eventModel = require('../models/event');
var router = express.Router();

router.get('/login', function(req, res, next) {
	res.render('login');
});

router.post('/login', function(req, res, next) {
	var message = '';

	if (req.body.user_id && req.body.password) {
		var model = new eventModel;
		model.getLoginUser(req.body.user_id, req.body.password, function(err, rows, fields)
		{
			if (rows.length > 0) {
				req.auth.login(rows[0]);
				res.redirect('/');
			} else {
				message = 'IDとパスワードが間違っています';
				res.render('login', {message: message});
			}
		});
	} else {
		message = '入力してください';
		res.render('login', {message: message});
	}
});

router.get('/logout', function(req, res, next) {
	req.auth.logout();
	res.redirect('/');
});

module.exports = router;