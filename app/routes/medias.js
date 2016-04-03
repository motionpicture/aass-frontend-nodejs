var express = require('express');
var logger = require('../modules/logger');
var mediaModel = require('../models/media');
var mediaService = require('../modules/mediaService');
var amsSdk = require('node-ams-sdk')
var azure = require('azure');
/* http://azure.github.io/azure-storage-node/index.html */
var path = require('path');
var fs = require('fs')

var router = express.Router();

var mediaService = new amsSdk({
	client_id: 'testaassmediasvc',
	client_secret: 'yG89PW/iK/ftU37SgliqOwvM2/I0DY6xzp7PzEmvS24='
});

var blobService = azure.createBlobService(
	'mediasvcdtgv96fwgm0zz',
	"y+Vxc5Lzb4M8zISt6MxPwQ27A4Akvd438MxLhRx/S/U/ISFu+8X1jidBWY/HvX+RgZcKUdMDY/VTR3bSnkhHlw=="
);

function generateBlockId(blockCount)
{
	var strPadLeft = String(blockCount);
	while (strPadLeft.length < 6) {
		strPadLeft = '0' + strPadLeft;
	}
	return new Buffer('block-' + strPadLeft).toString('base64');
}

router.get('/medias', function(req, res, next) {
	var model = new mediaModel;
	model.getListByEventId(req.auth.getId(), function(err, rows, fields)
	{
		logger.system.info('rows count:' + rows.length);
		res.render('media/index', {medias: rows});
	});
});

router.get('/media/new', function(req, res, next) {
	res.render('media/edit');
});

router.post('/media/create', function(req, res, next) {
	var isSuccess = false;
	var messages = [];
	var params = req.body;
	params.id = '';
	params.event_id = req.auth.getId();

	var model = new mediaModel;
	model.insert(params, function(err, result) {
		if (err) throw err;
		logger.system.debug('insert result...');
		logger.system.debug(result);

		isSuccess = true;

		res.setHeader('Content-Type', 'application/json');
		res.json({
			isSuccess: isSuccess,
			messages: messages
		});
	});
});

router.post('/media/createAsset', function(req, res, next) {
	var isSuccess = false;
	var messages = [];
	var params = {};

	var uniqid = require('uniqid');
	var filename = req.auth.getUserId() + uniqid();
	console.log(filename);

	// アセット作成	
	mediaService.setToken(function (err) {
		console.log(err);
		mediaService.createAsset({
			Name: filename
		}, function (error, response) {
			if (!error) {
				var data = JSON.parse(response.body);
				if (!data.error) {
					var asset = data.d;
					params = {
						assetId: asset.Id,
						container: path.basename(asset.Uri),
						filename: filename
					};

					isSuccess = true;
					logger.system.debug(params);
				} else {
					messages.push(data.error.message.value);
				}
			}

			res.setHeader('Content-Type', 'application/json');
			res.json({
				isSuccess: isSuccess,
				messages: messages,
				params: params
			});
		});
	});
});

router.post('/media/appendFile', function(req, res, next) {
	var isSuccess = false;
	var messages = [];
	var params = req.body;
	var file = req.files[0];
	logger.system.debug(params);
	logger.system.debug(req.files);

	// コンテンツファイル読み込み(ファイルはbufferのまま扱う)
//	fs.readFile(file.path, null, function (err, data) {
//		if (!err) {
			logger.system.debug('content size:' + file.buffer.length);

			var end = false;
			var counter = 0;
			var body = '';
			var container = params.container;
			var blob = params.filename + '.' + params.extension;
//			var content = data;
			var content = file.buffer;
			var blockSize = 4194304;
			var blockIdCount = Math.ceil(content.length / blockSize);
			var createdBlockIds = [];

			while (!end) {
				var readPos = blockSize * counter;
				var endPos = readPos + blockSize;
				if (endPos >= content.length) {
					endPos = content.length;
					end = true;
				}

				body = content.slice(readPos, endPos);
				logger.system.debug('body size:' + body.length);

				blockId = generateBlockId(parseInt(params.index) + counter);
				logger.system.debug('blockId:' + blockId);

				// ブロブブロック作成
				blobService.createBlockFromText(blockId, container, blob, body, {}, function(error)
				{
					logger.system.info('createBlockFromText result...');
					logger.system.info(error);
					createdBlockIds.push(blockId);

					if (createdBlockIds.length == blockIdCount) {
						isSuccess = true;

						res.setHeader('Content-Type', 'application/json');
						res.json({
							isSuccess: isSuccess,
							messages: messages
						});
					}
				});

				counter++;
			}
//		} else {
//			res.setHeader('Content-Type', 'application/json');
//			res.json({
//				isSuccess: isSuccess,
//				messages: messages
//			});
//		}
//	});
});

router.post('/media/commitFile', function(req, res, next) {
	var isSuccess = false;
	var messages = [];
	var params = req.body;
	logger.system.debug(params);

	var container = params.container;
	var blob = params.filename + '.' + params.extension;
	var blockList = [];
	for (var i = 0; i < params.blockCount; i++) {
		blockList.push(generateBlockId(i));
	}

	// コミット
	blobService.commitBlocks(container, blob, {LatestBlocks: blockList}, {}, function(error, blocklist, response)
	{
		logger.system.info('commitBlocks result...');
		logger.system.info(error);
		logger.system.info('commitBlocks statusCode:' + response.statusCode);

		if (!error && response.isSuccessful) {
			// アセットメタデータ作成
			mediaService.getAssetMetadata(params.asset_id, function(error, response)
			{
				logger.system.info('getAssetMetadata statusCode:' + response.statusCode);
				isSuccess = true;

				res.setHeader('Content-Type', 'application/json');
				res.json({
					isSuccess: isSuccess,
					messages: messages
				});
			});
		}
	});
});

router.get('/media/:id/edit', function(req, res, next) {
	res.send('edit');
});

router.get('/media/:id/download', function(req, res, next) {
});

router.post('/media/:id/delete', function(req, res, next) {
});

router.post('/media/:id/apply', function(req, res, next) {
});

module.exports = router;
