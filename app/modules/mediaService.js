var AzureService = require('node-ams-sdk')

var mediaService = new AzureService({
	client_id: 'testaassmediasvc',
	client_secrect: 'yG89PW/iK/ftU37SgliqOwvM2/I0DY6xzp7PzEmvS24='
});
mediaService.setToken(function (err)
{
    //check for error
    //do other stuff. no response returned.
});

module.exports = mediaService;