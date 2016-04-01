var db = require('../modules/db');
var logger = require('../modules/logger');

var eventModel = {
  getLoginUser: function(userId, password, callback)
  {
    var query = 'SELECT * FROM event WHERE user_id = :userId AND password = :password LIMIT 1';
    var params = {
        userId: userId,
        password: password
    };
    db.query(query, params, callback);
  }
};

module.exports = eventModel;
