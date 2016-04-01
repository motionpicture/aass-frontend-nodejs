var db = require('../modules/db');
var logger = require('../modules/logger');

var model = {
	STATUS_ASSET_CREATED: 1, // アセット作成済み(ジョブ待ち)
	STATUS_JOB_CREATED: 2, // ジョブ作成済み(mp4エンコード中)
	STATUS_JOB_FINISHED: 3, // ジョブ完了
	STATUS_JPEG2000_READY: 4, // JPEG2000エンコード待ち
	STATUS_JPEG2000_ENCODED: 5, // JPEG2000エンコード済み
	STATUS_ERROR: 8, // エンコード失敗
	STATUS_DELETED: 9, // 削除済み

	getListByEventId: function(eventId, callback)
	{
		var query = 'SELECT * FROM media WHERE event_id = :eventId AND status <> :status';
		var params = {
			eventId: eventId,
			status: this.STATUS_DELETED
		};

		db.query(query, params, callback);
	},

	insert: function(params, callback)
	{
		var query = 'INSERT INTO media (event_id, title, description, uploaded_by, status, filename, size, extension, playtime_string, playtime_seconds, asset_id, created_at, updated_at)'
				+ ' VALUES (:eventId, :title, :description, :uploadedBy, :status, :filename, :size, :extension, :playtimeString, :playtimeSeconds, :assetId, NOW(), NOW())';
		var params = {
			eventId: params.event_id,
			title: params.title,
			description: params.description,
			uploadedBy: params.uploaded_by,
			status: this.STATUS_ASSET_CREATED,
			filename: params.filename,
			size: params.size,
			extension: params.extension,
			playtimeString: null,
			playtimeSeconds: null,
			assetId: params.asset_id
		};

		db.query(query, params, callback);
	}
};

module.exports = model;
