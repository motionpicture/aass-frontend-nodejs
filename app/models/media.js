"use strict";

var Base = require('./Base');
var Constants = require('../modules/Constants');

class Media extends Base
{
    getListByEventId(eventId, callback)
    {
        var query = 'SELECT * FROM media WHERE event_id = :eventId AND status <> :status';
        var queryParams = {
            eventId: eventId,
            status: Constants.MEDIA_STATUS_DELETED
        };

        this.db.query(query, queryParams, callback);
    };

    insert(params, callback)
    {
        var query = 'INSERT INTO media (event_id, title, description, uploaded_by, status, filename, size, extension, playtime_string, playtime_seconds, asset_id, created_at, updated_at)'
            + ' VALUES (:eventId, :title, :description, :uploadedBy, :status, :filename, :size, :extension, :playtimeString, :playtimeSeconds, :assetId, NOW(), NOW())';
        var queryParams = {
            eventId: params.event_id,
            title: params.title,
            description: params.description,
            uploadedBy: params.uploaded_by,
            status: Constants.MEDIA_STATUS_ASSET_CREATED,
            filename: params.filename,
            size: params.size,
            extension: params.extension,
            playtimeString: null,
            playtimeSeconds: null,
            assetId: params.asset_id
        };

        this.db.query(query, queryParams, callback);
    };
}

module.exports = Media;
