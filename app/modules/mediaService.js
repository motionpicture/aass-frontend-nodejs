var ams = require('node-ams-sdk')
import conf = require('config');

var mediaService = new ams({
    client_id: conf.get('media_service_account_name'),
    client_secrect: conf.get('media_service_account_key')
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

export default mediaService;