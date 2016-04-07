"use strict";

var db = require('../modules/DB');
var logger = require('../modules/Logger');

class BaseModel
{
    constructor()
    {
        this.db = db;
        this.logger = logger;
    }
}

module.exports = BaseModel;
