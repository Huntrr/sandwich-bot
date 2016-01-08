/*
 * Handles channel joining, naming, privating, etc
 */


'use strict';

let config = require('./../bot/config');
let users = require('./users');
let _ = require('underscore');

let MongoClient = require('mongodb').MongoClient;
let url = config.db.url;
let EXECUTE = function (cb) {
  MongoClient.connect(url, (err, db) => {
    if(err) return console.error(err);
    cb(db);
  });
};


// functions
module.exports.getChannelList = (cb) => {
  EXECUTE( (db) => {
    db.collection('channels').find({
      name: { $exists: true },
      $or: [ {hidden: { $exists: false }}, {hidden: false} ]
    }, {name: 1}).toArray( (err, array) => {
      if(err) return console.error(err);

      cb(_.map(array, (chan) => chan.name));
      db.close();
    });
  });
}

module.exports.getChannelName = (channelID, cb) => {
  EXECUTE( (db) => {
    cb(
      db.collection('channels').findOne({ threadID: channelID }).name ||
        '[ERROR: channel is closed and has no public name]'
    );
  });
}

module.exports.setChannelName = (channelID, newName, api) => {
  EXECUTE( (db) => {
    db.collection('channels').find({ name: newName }).count( (err, count) => {
      if(err) return console.error(err);

      if(count > 0) {
        return api.sendMessage( {body: `There's already a channel ` +
                              `named ${newName}`}, channelID);
      }

      db.collection('channels').update({ threadID: channelID },
                                       { $set: { name: newName } },
                                       (err, result) => {
                                         if(err) return console.error(err);
                                         
                                         api.setTitle(newName, channelID);

                                         if(result.result.nModified === 0) {
                                           // add the channel
                                           db.collection('channels').insertOne({
                                             threadID: channelID,
                                             name: newName,
                                             hidden: true,
                                             users: []
                                           });
                                         }
                                       });
    });
  });
}

module.exports.getChannelDesc = (channelID, cb) => {
  EXECUTE( (db) => {
    cb(
      db.collection('channels').findOne({ threadID: channelID }).desc ||
        '[ERROR: no description for this channel]'
    );
  });
}

module.exports.setChannelDesc = (channelID, newDesc) => {
  EXECUTE( (db) => {
    db.collection('channels').update({ threadID: channelID },
                                     { $set: { desc: newDesc } },
                                     (err, result) => {
                                       if(err) return console.error(err);

                                       if(result.result.nModified === 0) {
                                         // add the channel
                                         db.collection('channels').insertOne({
                                           threadID: channelID,
                                           desc: newDesc,
                                           hidden: true,
                                           users: []
                                         });
                                       }
                                     });
  });
}

module.exports.setChannelPrivate = (channelID, hidden) => {
  EXECUTE( (db) => {
    db.collection('channels').update({ threadID: channelID },
                                     { $set: { hidden: hidden } }, db.close);
  });
}

module.exports.setChannelPassword = (channelID, password) => {
  EXECUTE( (db) => {
    if(password === undefined || password === "" || password === null) {
      db.collection('channels').update({ threadID: channelID},
                                       { $unset: { password: "" } }, db.close);
    } else {
      db.collection('channels').update({ threadID: channelID},
                                       { $set: { password: password } },
                                       db.close);
    }
  });
}

module.exports.banFromChannel = (userID, channelID) => {
  EXECUTE( (db) => {
    db.collection('channels').update({threadID: channelID},
                                     { $addToSet: { banned: userID }},
                                     db.close);
  });
}

module.exports.unbanFromChannel = (userID, channelID) => {
  EXECUTE( (db) => {
    db.collection('channels').update({threadID: channelID},
                                     {$pull: { banned: userID }}, db.close);
  });
}

module.exports.joinChannel = (api, channelName, userID, password) => {
  EXECUTE( (db) => {
    let channel = db.collection('channels').findOne({name: channelName});

    if(!channel) {
      db.close();
      return api.sendMessage({body: `No channel named ${channelName}`},
                             userID);
    }

    if(_.contains(channel.banned, userID)) {
      db.close();
      return api.sendMessage(
        {body: `Sorry, you've been banned from ${channelName}`}, userID
      );
    }

    if(!channel.password || channel.password === password) {
      db.close();
      api.sendMessage({body: `Joining ${channelName}`}, userID);
      api.addUserToGroup(userID, channel.threadID, (err) => {
        if(err) return api.sendMessage({body: `Error: ${err}`}, userID);
      });
    } else {
      db.close();
      let msg = password ? `Invalid password for ${channelName}` :
        `Please enter a password while joining ${channelName}`;

      return api.sendMessage({body: msg},
                             userID);
    }
  });
}

module.exports.leaveChannel = (api, channelID, userID) => {
  EXECUTE( (db) => {
    api.removeUserFromGroup(userID, channelID);
    api.sendMessage({body: "Leaving that channel"}, userID);
  });
}

