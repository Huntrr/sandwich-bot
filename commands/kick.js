'use strict';

/**
 * Simple example KICK command.
 * Shows how commands are composed of several variables and functions:
 * - command: the triggering string
 * - usage: a description of the arguments
 * - description: a description of the behavior
 * - onInit: Run on initialization of the Facebook API
 * - handler: Run when the command is triggered
 */

const _ = require('underscore');
const findUser = require('./../utilities/findUser');
const Users = require('./../utilities/users');

let myID = 0; // so as to not kick myself

module.exports.command = 'kick';

module.exports.usage = '<user to kick>';
module.exports.description = 'Kicks a given user from the current channel';

module.exports.onInit = (api) => myID = api.getCurrentUserID();

module.exports.handler = (api, args, message) => {
  
  Users.hasPerm(message.threadID, message.senderID, "mod", (isMod) => {
    if(!isMod) {
      return api.sendMessage({body: "You don't have permission to do that!"},
                             message.threadID);
    }

    if(args.length < 1) {
      return api.sendMessage({body: '... Who do you want me to kick?'},
                      message.threadID);
    }

    let search = args.join(' ');

    findUser(api, message, search, (toKick) => {
      if(toKick.length === 0) {
        return api.sendMessage({body: `No one here is named ${search}`},
                               message.threadID);
      } else if(toKick.length > 1) {
        let intro = `Ambiguous statement. ` +
          `I found the following matches for ${search}:`;

        let body = _.reduce(toKick, (acc, user) => acc + '\n' + user.name, intro);
        return api.sendMessage({body: body}, message.threadID);
      } else {
        let user = toKick[0];
        if(user.id === myID) {
          api.removeUserFromGroup(message.senderID, message.threadID);
          return api.sendMessage({body: `Kicking ${message.senderName} because ` +
                          `they thought they were clever and tried to kick me!`},
                          message.threadID);
        }

        Users.hasPerm(message.threadID, user.id, "unkickable", (cantKick) => {
          if(cantKick) {
            return api.sendMessage({body: `Whoops, ${user.name} is unkickable`},
                                   message.threadID);
          }

          api.sendMessage({body: `Alright, kicking ${user.name}`},
                          message.threadID);

          api.removeUserFromGroup(user.id, message.threadID);
        });
      }
    });
  });
};
