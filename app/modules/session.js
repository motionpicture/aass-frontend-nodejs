var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var conf = require('config');

module.exports = session({
	secret: 'aass secret', 
	resave: false,
	rolling: true,
	saveUninitialized: false,
	store: new RedisStore({
		host: conf.redis_host,
		port: conf.redis_port,
		pass: conf.redis_key,
	}),
	cookie: {
		maxAge: 60 * 60 * 1000
	}
});