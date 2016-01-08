'use strict';

let config = require('./../bot/config');
let _ = require('underscore');

let MongoClient = require('mongodb').MongoClient;
let url = config.db.url;
let EXECUTE = function (cb) {
  MongoClient.connect(url, (err, db) => {
    if(err) return console.error(err);
    cb(db);
  });
};

EXECUTE((db) => {
  db.collection('channels').find({ "threadID": -1 }).count((err, count) => {
    if(err) return console.error(err);

    if(count < 1) {
      let obj = {
        "threadID": -1,
        "users": [
          {
            "userID": parseInt(config.owner) || 0,
            "name": parseInt(config.ownerName) || "admin",
            "perms": ['op']
          }
        ]
      };

      db.collection('channels').insertOne(obj, (err, result) => {
        if(err) console.error(err);
        console.log(result);
        db.close();
      });
    } else {
      db.close();
    }
  });
});


module.exports.addThread = (threadID, ownerID, ownerName) => {
  threadID = parseInt(threadID);
  ownerID = parseInt(ownerID);
  EXECUTE((db) => {
    let obj = {
      "threadID": threadID,
      "users": [
        { 
          "userID": ownerID,
          "name": ownerName,
          "perms": ['mod']
        }
      ]
    };

    db.collection('channels').insertOne(obj, (err, result) => {
      if(err) console.error(err);
      console.log(result);
      db.close();
    });
  });
};

module.exports.removeThread = (threadID) => {
  threadID = parseInt(threadID);
  EXECUTE((db) => {
    db.collection('channels').deleteMany({ "threadID": threadID },
                                         (err, results) => {
      console.log(results);
      db.close();
    });
  });
};

module.exports.addPerm = (threadID, userID, name, perm) => {
  userID = parseInt(userID);
  threadID = parseInt(threadID);

  EXECUTE((db) => {
    db.collection('channels').update({
      "threadID": threadID,
      "users.userID": userID
    }, { $addToSet: { "users.$.perms": perm } }, (err, count) => {
      if(err) return console.error(err);
      console.log(count);
      count = count.result.nModified;
      if(count < 1) {
        console.log("ADDING USER");
        db.collection('channels').update({ "threadID": threadID },
                                         { $addToSet: { "users": {
                                             "userID": userID,
                                             "name": name,
                                             "perms": [perm]
                                         } } }, (err, count) => {
                                           if(err) return console.error(err);
                                           console.log("ADDED USER: " + count);
                                           count = count.result.nModified;
                                           if(count < 1) {
                                             let obj = {
                                               "threadID": threadID,
                                               "users": [
                                                 { 
                                                   "userID": userID,
                                                   "name": name,
                                                   "perms": [perm]
                                                 }
                                               ]
                                             };

                                             db.collection('channels').insertOne(obj, (err, result) => {
                                               if(err) console.error(err);
                                               console.log(result);
                                               db.close();
                                             });

                                           }
                                           db.close();
                                         });
      } else {
        db.close();
      }
    });
  });
};

module.exports.removePerm = (threadID, userID, perm) => {
  userID = parseInt(userID);
  threadID = parseInt(threadID);

  EXECUTE((db) => {
    db.collection('channels').update({
      "threadID": threadID,
      "users.userID": userID
    }, { $pull: { "users.$.perms": perm } }, (err, count) => {
      if(err) console.error(err);
      db.close();
    });
  });
};

module.exports.hasPerm = (threadID, userID, perm, cb) => {
  userID = parseInt(userID);
  threadID = parseInt(threadID);

  console.log(userID);
  EXECUTE((db) => {
    db.collection('channels').aggregate([
      { $match: { $or: [ {"threadID": -1}, {"threadID": threadID} ] } },
      { $unwind: "$users" },
      { $match: { "users.userID": userID } },
      { $unwind: "$users.perms" },
      { $group: {
        _id: "$users.userID", "perms": { $addToSet: "$users.perms" }
      } }
    ]).toArray( (err, result) => {
      if(err) return console.error(err);
      console.log(result);
      let permList = _.reduce(result, (acc, res) => acc.concat(res.perms), []);
      console.log(permList);

      db.close();

      cb(_.contains(permList, 'op') || _.contains(permList, perm));
    });
  });
};

module.exports.listPerms = (threadID, userID, cb) => {
  userID = parseInt(userID);
  threadID = parseInt(threadID);
  console.log(userID);

  EXECUTE((db) => {
    db.collection('channels').aggregate([
      { $match: { $or: [ {"threadID": -1}, {"threadID": threadID} ] } },
      { $unwind: "$users" },
      { $match: { "users.userID": userID } },
      { $unwind: "$users.perms" },
      { $group: {
        _id: "$users.userID", "perms": { $addToSet: "$users.perms" }
      } }
    ]).toArray( (err, result) => {
      if(err) return console.error(err);
      console.log(result);
      let permList = _.reduce(result, (acc, res) => acc.concat(res.perms), []);

      db.close();

      cb(permList);
    });
  });
};

module.exports.listUsersWithPerm = (threadID, perm, cb) => {
  threadID = parseInt(threadID);

  EXECUTE((db) => {
    db.collection('channels').aggregate([
      { $match: { $or: [ {"threadID": -1}, {"threadID": threadID} ] } },
      { $unwind: "$users" },
      { $unwind: "$users.perms" },
      { $match: { "users.perms": perm } },
      { $group: {
        _id: "$users.userID", "name": { $first: "$users.name" }
      } }
    ]).toArray( (err, result) => {
      if(err) return console.error(err);
      let list = _.reduce(result, (acc, res) => acc.concat(res.name), []);
      console.log(list);

      db.close();

      cb(list);
    });
  });
};
