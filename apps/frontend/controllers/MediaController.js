"use strict";

var BaseController = require('./BaseController');

var logger = require('../modules/logger');
var MediaModel = require('../models/MediaModel');
var blobService = require('../modules/blobService');
// import mediaService from '../modules/mediaService';
var path = require('path');
var fs = require('fs')

var amsSdk = require('node-ams-sdk')
var mediaService = new amsSdk({
    client_id: 'testaassmediasvc',
    client_secret: 'yG89PW/iK/ftU37SgliqOwvM2/I0DY6xzp7PzEmvS24='
});

class AuthController extends BaseController
{
    list(req, res, next)
    {
        var model = new MediaModel();
        model.getListByEventId(req.auth.getId(), function(err, rows, fields)
        {
            logger.system.info('rows count:' + rows.length);
            res.render('media/index', {medias: rows});
        });
    }

    create(req, res, next)
    {
        if (req.method == "POST") {
            var isSuccess = false;
            var messages = [];
            var params = req.body;
            params.id = '';
            params.event_id = req.auth.getId();

            var model = new MediaModel;
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
        } else {
            res.render('media/edit');
        }
    }

    createAsset(req, res, next) {
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
    }

    appendFile(req, res, next)
    {
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
        var blockId;

        while (!end) {
            var readPos = blockSize * counter;
            var endPos = readPos + blockSize;
            if (endPos >= content.length) {
                endPos = content.length;
                end = true;
            }

            body = content.slice(readPos, endPos);
            logger.system.debug('body size:' + body.length);

            blockId = this.generateBlockId(parseInt(params.index) + counter);
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
    }

    commitFile(req, res, next)
    {
        var isSuccess = false;
        var messages = [];
        var params = req.body;
        logger.system.debug(params);

        var container = params.container;
        var blob = params.filename + '.' + params.extension;
        var blockList = [];
        for (var i = 0; i < params.blockCount; i++) {
            blockList.push(this.generateBlockId(i));
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
    }

    generateBlockId(blockCount)
    {
        var strPadLeft = String(blockCount);
        while (strPadLeft.length < 6) {
            strPadLeft = '0' + strPadLeft;
        }

        return new Buffer('block-' + strPadLeft).toString('base64');
    }

    edit(req, res, next)
    {
    }

    delete(req, res, next)
    {
        var isSuccess = false;
        var messages = [];

        logger.system.debug('deleting media... id:', req.params.id);
        var model = new MediaModel;
        model.deleteById(req.params.id, function(err, result) {
            if (err) throw err;
            logger.system.debug('delete result...', result);

            isSuccess = true;

            res.setHeader('Content-Type', 'application/json');
            res.json({
                isSuccess: isSuccess,
                messages: messages
            });
        });
    }

    download(req, res, next)
    {
    }

    apply(req, res, next)
    {
    }
}

module.exports = AuthController;
