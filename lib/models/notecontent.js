// Create note contens model for storing content

var RSVP = require('rsvp');
var _ = require('lodash');
var Schema = require('jugglingdb').Schema;

module.exports = function (addon) {
  var schema = addon.schema;

  // TODO add foreign key contraints
  schema.extend('NoteContents', {
    groupId: {type: String},
    roomId: {type: String},
    content: {type: Schema.Text}
  }, {
    indexes: {
      note_content_group_room: {
        keys: ['groupId', 'roomId'],
        type: 'btree',
        kind: 'unique'
      }
    }
  });

  var models = schema.models;

  return {
    // find models by groupId and roomId, returns a promise
    findByGroupIdAndRoomId: function (groupId, roomId) {
      return new RSVP.Promise(function (resolve, reject) {
        var where = {
          groupId: groupId,
          roomId: roomId
        };
        models.NoteContents.all({
          where: where
        }, function (err, models) {
          if (err) return reject(err);
          var result = models.length == 0 ? null : models[0];
          resolve(result);
        });
      });
    },

    // update or create a model, returns a promise
    upsert: function (noteContent) {
      var _this = this;
      return new RSVP.Promise(function (resolve, reject) {
        _this.findByGroupIdAndRoomId(noteContent.groupId, noteContent.roomId)
            .then(function (existingNoteContent) {
              if (existingNoteContent) {
                _.extend(existingNoteContent, noteContent);
              } else {
                existingNoteContent = noteContent;
              }
              models.NoteContents.upsert(existingNoteContent, function (err, models) {
                if (err) return reject(err);
                resolve(models);
              });
            });
      });
    },

    deleteByGroupIdAndRoomId: function (groupId, roomId) {
      var _this = this;
      return new RSVP.Promise(function (resolve, reject) {
        _this.findByGroupIdAndRoomId(groupId, roomId)
            .then(function (existingNoteContent) {
              existingNoteContent.destroy(function (err) {
                if (err) return reject(err);
                resolve();
              });
            });
      });
    }
  };
};