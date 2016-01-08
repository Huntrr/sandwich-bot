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
    }, {name: 1, desc: 1}).toArray( (err, array) => {
      if(err) return console.error(err);

      cb(_.map(array, (chan) => `${chan.name} - ${chan.desc}`));
      db.close();
    });
  });
}

module.exports.getChannelName = (channelID, cb) => {
  channelID = parseInt(channelID);
  console.log(channelID);

  EXECUTE( (db) => {
    db.collection('channels').findOne({ _id: channelID }, 
      (err, channel) => {
        if(err) return console.error(err);
        if(channel && channel.name) {
          cb(channel.name);
        } else {
          cb('[ERROR: channel is closed and has no public name]');
        }
    });
  });
}

module.exports.setChannelName = (channelID, newName, api) => {
  channelID = parseInt(channelID);
  EXECUTE( (db) => {
    db.collection('channels').find({ name: newName }).count( (err, count) => {
      if(err) return console.error(err);

      if(count > 0) {
        return api.sendMessage( {body: `There's already a channel ` +
                              `named ${newName}`}, channelID);
      }

      db.collection('channels').update({ _id: channelID },
                                       { $set: { name: newName } },
                                       (err, result) => {
                                         if(err) return console.error(err);
                                         
                                         api.setTitle(newName, channelID);

                                         if(result.result.nModified === 0) {
                                           // add the channel
                                           db.collection('channels').insertOne({
                                             _id: channelID,
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
  channelID = parseInt(channelID);
  EXECUTE( (db) => {
    db.collection('channels').findOne({ _id: channelID }, 
      (err, channel) => {
        if(err) return console.error(err);
        if(channel && channel.desc) {
          cb(channel.desc);
        } else {
          cb('[ERROR: channel has no description]');
        }
    });
  });
}

module.exports.setChannelDesc = (channelID, newDesc) => {
  channelID = parseInt(channelID);
  EXECUTE( (db) => {
    db.collection('channels').update({ _id: channelID },
                                     { $set: { desc: newDesc } },
                                     (err, result) => {
                                       if(err) return console.error(err);

                                       if(result.result.nModified === 0) {
                                         // add the channel
                                         db.collection('channels').insertOne({
                                           _id: channelID,
                                           desc: newDesc,
                                           hidden: true,
                                           users: []
                                         });
                                       }
                                     });
  });
}

module.exports.setChannelPrivate = (channelID, hidden) => {
  channelID = parseInt(channelID);
  EXECUTE( (db) => {
    db.collection('channels').update({ _id: channelID },
                                     { $set: { hidden: hidden } },
                                     () => db.close());
  });
}

module.exports.setChannelPassword = (channelID, password) => {
  channelID = parseInt(channelID);
  console.log(password);
  EXECUTE( (db) => {
    if(password === undefined || password === "" || password === null) {
      console.log("UNSETTING PASSWORD");
      db.collection('channels').update({ _id: channelID},
                                       { $unset: { password: "" } },
                                       () => db.close());
    } else {
      console.log("SETTING PASSWORD");
      db.collection('channels').update({ _id: channelID},
                                       { $set: { password: password } },
                                       () => db.close());
    }
  });
}

module.exports.banFromChannel = (userID, channelID) => {
  userID = parseInt(userID);
  channelID = parseInt(channelID);
  EXECUTE( (db) => {
    db.collection('channels').update({_id: channelID},
                                     { $addToSet: { banned: userID }},
                                     () => db.close());
  });
}

module.exports.unbanFromChannel = (userID, channelID) => {
  userID = parseInt(userID);
  channelID = parseInt(channelID);
  EXECUTE( (db) => {
    db.collection('channels').update({_id: channelID},
                                     {$pull: { banned: userID }},
                                     () => db.close());
  });
}

module.exports.joinChannel = (api, channelName, userID, password) => {
  userID = parseInt(userID);

  EXECUTE( (db) => {
    db.collection('channels').findOne({name: channelName}, (err, channel) => {
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
        api.addUserToGroup(userID, channel._id, (err) => {
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
  });
}

module.exports.leaveChannel = (api, channelID, userID) => {
  userID = parseInt(userID);
  channelID = parseInt(channelID);
  EXECUTE( (db) => {
    api.removeUserFromGroup(userID, channelID);
    api.sendMessage({body: "Leaving that channel"}, userID);
  });
}

