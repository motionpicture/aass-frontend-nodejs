var expressSession = require('express-session');
//var RedisStore = require('connect-redis')(expressSession);

/*
var session = expressSession({
	secret: 'aass secret', 
	resave: false,
	saveUninitialized: false,
	store: new RedisStore({
//		host: 'tcp://testaassredis.redis.cache.windows.net:6379?auth=UavbYEE%2BmClF3BHdhrvVtEcKxMcbkzacsuzTqBQVFI4%3D',
//		port: 6379,
//		prefix: 'sid:',
//		socket: '',
		url: 'tcp://testaassredis.redis.cache.windows.net:6379?auth=UavbYEE%2BmClF3BHdhrvVtEcKxMcbkzacsuzTqBQVFI4%3D'
	}),
	cookie: {
		maxAge: 30 * 60 * 1000
	}
});
*/

var session = expressSession({
	secret: 'aass secret',
	resave: true,
	saveUninitialized: false,
	cookie: {
		maxAge: 3 * 60 * 1000
	}
});

module.exports = session;