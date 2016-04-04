var ams = require('node-ams-sdk')
var conf = require('config');

var mediaService = new ams({
	client_id: conf.media_service_account_name,
	client_secrect: conf.media_service_account_key
});

//var mediaService = new amsSdk({
//    client_id: 'testaassmediasvc',
//    client_secret: 'yG89PW/iK/ftU37SgliqOwvM2/I0DY6xzp7PzEmvS24='
//});
//mediaService.setToken(function (err)
//{
    //check for error
    //do other stuff. no response returned.
//});

module.exports = mediaService;