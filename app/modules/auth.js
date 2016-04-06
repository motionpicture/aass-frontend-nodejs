"use strict";

var Constants = require('./Constants');

module.exports = function(req, res, next)
{
    var auth = new Auth(req);
    req.auth = auth;

    res.locals.userId = auth.getUserId();

    if (req.originalUrl == '/login') {
        next();
        return;
    }

    if (auth.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}

class Auth
{
    constructor(req)
    {
        this.req = req;
    }

    isAuthenticated()
    {
        return (this.req.session[Constants.AUTH_SESSION_NAME]);
    }

    login(params)
    {
        this.req.session[Constants.AUTH_SESSION_NAME] = params;
    }

    logout()
    {
        delete this.req.session[Constants.AUTH_SESSION_NAME];
    }

    getId()
    {
        return (this.req.session.hasOwnProperty(Constants.AUTH_SESSION_NAME)) ? this.req.session[Constants.AUTH_SESSION_NAME].id : null;
    }

    getUserId()
    {
        return (this.req.session.hasOwnProperty(Constants.AUTH_SESSION_NAME)) ? this.req.session[Constants.AUTH_SESSION_NAME].user_id : null;
    }
}
