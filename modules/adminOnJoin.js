'use strict';

let Users = require('./../utilities/users');

// Makes whoever invites sandwich to a channel an admin in that channel
module.exports.onMessage = (api, message) => {
  if(message.type === 'event') {
    if(message.logMessageType === 'log:subscribe') {
      api.getUserInfo(message.author, (err, user) => {
        if(err) return console.error(err);

        user = user[message.author];
        Users.addThread(message.threadID, message.author, user.name);
      });
    } else if(message.logMessageType === 'log:unsubscribe') {
      Users.removeThread(message.threadID);
    }
  }
};
