var log4js = require('log4js');

log4js.configure({
	"appenders": [
		{
			"category": "access",
			"type": "dateFile",
			"filename": __dirname + "/../../logs/access.log",
			"pattern": "-yyyy-MM-dd",
			"backups": 3
		},
		{
			"category": "system",
			"type": "dateFile",
			"filename": __dirname + "/../../logs/system.log",
			"pattern": "-yyyy-MM-dd",
			"backups": 3
		},
		{
			"category": "error",
			"type": "dateFile",
			"filename": __dirname + "/../../logs/error.log",
			"pattern": "-yyyy-MM-dd",
			"backups": 3
		},
		{
			"type": "console"
		}
	],
	"levels": {
		"access": "ALL",
		"system": "ALL",
		"error": "ALL"
	}
});

module.exports = { 
	access: log4js.getLogger('access'),
	system: log4js.getLogger('system'),
	error: log4js.getLogger('error'),
	express: log4js.connectLogger(log4js.getLogger('access'), {level: log4js.levels.INFO})
};