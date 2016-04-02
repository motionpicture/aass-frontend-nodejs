var db = require('../modules/db');
var logger = require('../modules/logger');

module.exports = model;
function model() {
}

model.prototype.db = db;
model.prototype.logger = logger;