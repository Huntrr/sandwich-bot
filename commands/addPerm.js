'use strict';

const _ = require('underscore');
const findUser = require('./../utilities/findUser');
const Users = require('./../utilities/users');

module.exports.command = 'addPerm';

module.exports.usage = '<permission to add> <user to add to>';
module.exports.description = 'Adds a given permission to a given user';

module.exports.handler = (api, args, message) => {
  
  if(args.length < 2) {
    return api.sendMessage({body: 'Invalid form'},
                    message.threadID);
  }

  let globalPerm = false;
  if(args[0] === '-g') {
    globalPerm = true;
    args.shift();
  }

  if(args.length < 2) {
    return api.sendMessage({body: 'Invalid form'},
                    message.threadID);
  }
    
  let perm = args[0].toLowerCase(); 
  Users.hasPerm(message.threadID, message.senderID, globalPerm ? 'op' : perm,
                (result) => {
    if(!result) {
      return api.sendMessage({body: "You need that permission in order to " +
                             "give it to someone else!"},
                             message.threadID);
    }

    args.shift();
    let search = args.join(' ');

    findUser(api, message, search, (targets) => {
      if(targets.length === 0) {
        return api.sendMessage({body: `No one here is named ${search}`},
                               message.threadID);
      } else if(targets.length > 1) {
        let intro = `Ambiguous statement. ` +
          `I found the following matches for ${search}:`;

        let body = _.reduce(targets, (acc, user) => acc + '\n' + user.name,
                            intro);
        return api.sendMessage({body: body}, message.threadID);
      } else {
        let user = targets[0];

        api.sendMessage({body: `Alright, making ${user.name} a(n) ${perm}`},
                        message.threadID);

        Users.addPerm(globalPerm ? -1 : message.threadID,
                      user.id, user.name, perm);  
      }
    });
  });
};
