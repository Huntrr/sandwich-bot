'use strict';

const _ = require('underscore');
const Users = require('./../utilities/users');
const Channels = require('./../utilities/channels');

module.exports.command = 'unban';

module.exports.usage = '<user to unban>';
module.exports.description = 'Unbans a user from a channel';

module.exports.handler = (api, args, message) => {
  Users.hasPerm(message.threadID, message.senderID, "mod", (isMod) => {
    if(!isMod) {
      return api.sendMessage({body: "You don't have permission to do that!"},
                             message.threadID);
    }

    if(args.length < 1) {
      return api.sendMessage({body: '... Who do you want me to unban?'},
                      message.threadID);
    }

    let search = args.join(' ');

    api.getUserID(search, (err, toUnban) => {
      if(err) return console.log(err);

      if(toUnban.length === 0) {
        return api.sendMessage({body: `I found no one named ${search}`},
                               message.threadID);
      } else {
        _.each(toUnban, (user) => {
          Channels.unbanFromChannel(user.userID, message.threadID);
        });

        api.sendMessage({body: `Unbanning ${search} if they were banned`},
                        message.threadID);
      }
    });
  });
};
