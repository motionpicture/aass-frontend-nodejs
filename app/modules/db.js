var mysql = require('mysql');

var db = mysql.createConnection({
  host     : 'ja-cdbr-azure-east-a.cloudapp.net',
  user     : 'bb9a17e70e5122',
  password : '7132898f',
  database : 'testaasAoi6PUaV0'
});

db.config.queryFormat = function (query, values) {
  if (!values) return query;
  return query.replace(/\:(\w+)/g, function (txt, key) {
    if (values.hasOwnProperty(key)) {
      return this.escape(values[key]);
    }
    return txt;
  }.bind(this));
};

module.exports = db;