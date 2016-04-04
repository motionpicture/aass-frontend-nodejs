var express = require('express');
var logger = require('../modules/logger');
var mediaModel = require('../models/media');
var blobService = require('../modules/blobService');
var mediaService = require('../modules/mediaService');
var path = require('path');
var fs = require('fs')

var router = express.Router();


var amsSdk = require('node-ams-sdk')
var mediaService = new amsSdk({
    client_id: 'testaassmediasvc',
    client_secret: 'yG89PW/iK/ftU37SgliqOwvM2/I0DY6xzp7PzEmvS24='
});


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
	// ファイル受信イベント
	var server = req.socket.server;
	var io = require('socket.io')(server);
	io.on('connection', function(socket){
		console.log(socket.id);
		socket.on('createBlobBlock', function (data) {
			console.log(data);

			var isSuccess = false;
			var messages = [];
			logger.system.debug('content size:' + data.file.length);

			var end = false;
			var counter = 0;
			var body = '';
			var container = data.container;
			var blob = data.filename + '.' + data.extension;
			var content = data.file;
			var blockSize = 4194304;
			var blockIdCount = Math.ceil(content.length / blockSize);
			var createdBlockIds = [];

			while (!end) {
				var readPos = blockSize * counter;
				var endPos = readPos + blockSize;
				if (endPos >= content.length) {
					endPos = content.length;
					end = true;
					logger.system.debug('end:' + end);
				}

				body = content.slice(readPos, endPos);
				logger.system.debug('body size:' + body.length);

				blockId = generateBlockId(parseInt(data.index) + counter);
				logger.system.debug('blockId:' + blockId);

				// ブロブブロック作成
				logger.system.debug('creating block...');
				blobService.createBlockFromText(blockId, container, blob, body, {}, function(error)
				{
					logger.system.info('createBlockFromText result... blockId:' + blockId);
					if (error) throw error;
					logger.system.info(error);
					createdBlockIds.push(blockId);

					if (createdBlockIds.length == blockIdCount) {
						isSuccess = true;

						io.to(socket.id).emit('appendFile', {
							isSuccess: isSuccess,
							blockIndex: data.blockIndex
						});
					}
				});

				counter++;
			}
		});
	});

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

	// アセット作成	
	mediaService.setToken(function (err) {
		if (err) throw err;

		logger.system.debug('creating asset... name:' + filename);
		mediaService.createAsset({
			Name: filename
		}, function (error, response) {
			if (error) throw error;
			logger.system.debug('createAsset result...');

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
	logger.system.debug(file);
	logger.system.debug('content size:' + file.buffer.length);

	var end = false;
	var counter = 0;
	var body = '';
	var container = params.container;
	var blob = params.filename + '.' + params.extension;
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
			if (error) throw error;
			logger.system.info('createBlockFromText result... blockId:' + blockId);
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
