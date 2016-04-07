"use strict";

//http://azure.github.io/azure-storage-node/index.html
var azure = require('azure');
var conf = require('config');

var blobService = azure.createBlobService(
    conf.storage_account_name,
    conf.storage_account_key
);

module.exports = blobService;
