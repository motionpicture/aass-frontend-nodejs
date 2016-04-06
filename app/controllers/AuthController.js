"use strict";

var BaseController = require('./BaseController');
var EventModel = require('../models/EventModel');

class AuthController extends BaseController
{
    login(req, res, next)
    {
        if (req.method == "POST") {
            var message = '';

            if (req.body.user_id && req.body.password) {
                var model = new EventModel();
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
        } else {
            res.render('login');
        }
    }

    logout(req, res, next)
    {
        req.auth.logout();
        res.redirect('/');
    }
}

module.exports = AuthController;
