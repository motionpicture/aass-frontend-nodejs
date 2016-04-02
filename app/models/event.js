var inherits = require('util').inherits;
var base = require('./base');

module.exports = model;
inherits(model, base);
function model() {
	base.call(this);
}

model.prototype.getLoginUser = function (userId, password, callback) {
	var query = 'SELECT * FROM event WHERE user_id = :userId AND password = :password LIMIT 1';
	this.logger.system.debug(query);
	var params = {
		userId: userId,
		password: password
	};

	this.db.query(query, params, callback);
};