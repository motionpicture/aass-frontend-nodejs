var AzureService = require('node-ams-sdk')
var azure = require('azure');
/* http://azure.github.io/azure-storage-node/index.html */
var path = require('path');
var fs = require('fs')

var mediaService = new AzureService({
	client_id: 'testaassmediasvc',
	client_secret: 'yG89PW/iK/ftU37SgliqOwvM2/I0DY6xzp7PzEmvS24='
});

var blobService = azure.createBlobService(
	'mediasvcdtgv96fwgm0zz',
	"y+Vxc5Lzb4M8zISt6MxPwQ27A4Akvd438MxLhRx/S/U/ISFu+8X1jidBWY/HvX+RgZcKUdMDY/VTR3bSnkhHlw=="
);

mediaService.setToken(function (err)
{
	if (err) throw err;

	var filename = 'motionpicturetestfilename'

	// アセット作成	
	mediaService.createAsset({
		Name: filename
	}, function (err, res)
	{
		if (err) throw err;
		if (!err) {
			var data = JSON.parse(res.body);
			if (!data.error) {
				var asset = data.d;
				var params = {
					assetId: asset.Id,
					container: path.basename(asset.Uri),
					filename: filename
				};
				console.log(params);

				// コンテンツファイル読み込み(ファイルはbufferのまま扱う)
				fs.readFile(__dirname + '/logs/test_5mb.mp4', null, function (err, data) {
					if (err) {
						return console.log(err);
					}

					console.log(data.length);

					var end = false;
					var counter = 0;
					var body = '';
					var blob = params.filename + '.mp4';
					var container = params.container;
					var content = data;
					var blockSize = 4194304;
					var division = Math.ceil(content.length / blockSize);
					var createdBlocks = [];
	
					while (!end) {

						var readPos = blockSize * counter;
						var endPos = readPos + blockSize;
						if (endPos >= content.length) {
							endPos = content.length;
							end = true;
						}

						body = content.slice(readPos, endPos);
						console.log(body.length);

						blockId = generateBlockId(counter);
						console.log(blockId);

						// ブロブブロック作成
						blobService.createBlockFromText(blockId, container, blob, body, {}, function(error)
						{
							console.log(error);
							createdBlocks.push(blockId);
	
							if (createdBlocks.length == division) {
								var blockList = [];
								for (var i = 0; i < division; i++) {
									blockList.push(generateBlockId(i));
								}

								// コミット
								blobService.commitBlocks(container, blob, {LatestBlocks: blockList}, {}, function(error, blocklist, response)
								{
									console.log(error);
									console.log('commitBlocks statusCode:' + response.statusCode);

									if (!error && response.isSuccessful) {
										// アセットメタデータ作成
										mediaService.getAssetMetadata(params.assetId, function(error, response)
										{
											console.log(error);
											console.log('getAssetMetadata statusCode:' + response.statusCode);
										});
									}
								});
							}
						});

						counter++;
					}
				});
			} else {
				console.log(data.error.message.value);
			}
		}
	});
});

function generateBlockId(blockCount)
{
	var strPadLeft = String(blockCount);
	while (strPadLeft.length < 6) {
		strPadLeft = '0' + strPadLeft;
	}
	return new Buffer('block-' + strPadLeft).toString('base64');
}
