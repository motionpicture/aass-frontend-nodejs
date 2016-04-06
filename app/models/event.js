"use strict";

var Base = require('./Base');

class Event extends Base
{
    getLoginUser(userId, password, callback)
    {
        var query = 'SELECT * FROM event WHERE user_id = :userId AND password = :password LIMIT 1';
        this.logger.system.debug(query);
        var params = {
            userId: userId,
            password: password
        };

        this.db.query(query, params, callback);
    }
}

module.exports = Event;
