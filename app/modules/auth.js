var logger = require('./logger');

module.exports = function (req, res, next) {
	req.auth = new Auth(req);

	res.locals.userId = req.auth.getUserId();

	if (req.originalUrl == '/login') {
		next();
		return;
	}

	logger.system.debug('checking isAuthenticated...');
	logger.system.debug(req.session);
	if (req.auth.isAuthenticated()) {
		logger.system.debug('authenticated!');
		next();
	} else {
		logger.system.debug('need to login...');
		res.redirect('/login');
	}
};

function Auth(req) {
	this.req = req;
	this.AUTH_SESSION_NAME = 'AassFrontendAuth';
}

Auth.prototype.isAuthenticated = function () {
	return (this.req.session[this.AUTH_SESSION_NAME]);
};

Auth.prototype.login = function (params) {
	this.req.session[this.AUTH_SESSION_NAME] = params;
};

Auth.prototype.logout = function () {
	delete this.req.session[this.AUTH_SESSION_NAME];
};

Auth.prototype.getId = function () {
	return (this.req.session.hasOwnProperty(this.AUTH_SESSION_NAME)) ? this.req.session[this.AUTH_SESSION_NAME].id : null;
};

Auth.prototype.getUserId = function () {
	return (this.req.session.hasOwnProperty(this.AUTH_SESSION_NAME)) ? this.req.session[this.AUTH_SESSION_NAME].user_id : null;
};