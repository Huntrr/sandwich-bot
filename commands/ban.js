'use strict';

const _ = require('underscore');
const findUser = require('./../utilities/findUser');
const Users = require('./../utilities/users');
const Channels = require('./../utilities/channels');

let myID = 0; // so as to not ban myself

module.exports.command = 'ban';

module.exports.usage = '<user to ban>';
module.exports.description = 'Bans a user from a channel';

module.exports.onInit = (api) => myID = api.getCurrentUserID();

module.exports.handler = (api, args, message) => {
  Users.hasPerm(message.threadID, message.senderID, "mod", (isMod) => {
    if(!isMod) {
      return api.sendMessage({body: "You don't have permission to do that!"},
                             message.threadID);
    }

    if(args.length < 1) {
      return api.sendMessage({body: '... Who do you want me to ban?'},
                      message.threadID);
    }

    let search = args.join(' ');

    findUser(api, message, search, (toBan) => {
      if(toBan.length === 0) {
        return api.sendMessage({body: `No one here is named ${search}`},
                               message.threadID);
      } else if(toBan.length > 1) {
        let intro = `Ambiguous statement. ` +
          `I found the following matches for ${search}:`;

        let body = _.reduce(toBan, (acc, user) => acc + '\n' + user.name, intro);
        return api.sendMessage({body: body}, message.threadID);
      } else {
        let user = toBan[0];
        if(user.id === myID) {
          api.removeUserFromGroup(message.senderID, message.threadID);
          return api.sendMessage({body: `Kicking ${message.senderName} because ` +
                          `they thought they were clever and tried to ban me!`},
                          message.threadID);
        }

        Users.hasPerm(message.threadID, user.id, "unkickable", (cantKick) => {
          if(cantKick) {
            return api.sendMessage({body: `Whoops, ${user.name} is unbannable`},
                                   message.threadID);
          }

          api.sendMessage({body: `Alright, banning ${user.name}`},
                          message.threadID);

          api.removeUserFromGroup(user.id, message.threadID);
          Channels.banFromChannel(user.id, message.threadID);
        });
      }
    });
  });
};
