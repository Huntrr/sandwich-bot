'use strict';

const _ = require('underscore');
const findUser = require('./../utilities/findUser');
const Users = require('./../utilities/users');

module.exports.command = 'listPerms';

module.exports.usage = '<user to check>';
module.exports.description = 'Lists all the permissions of a given user';

module.exports.handler = (api, args, message) => {
  
  if(args.length < 1) {
    return api.sendMessage({body: 'Invalid form'},
                    message.threadID);
  }
    
  let search = args.join(' ');

  findUser(api, message, search, (targets) => {
    if(targets.length === 0) {
      return api.sendMessage({body: `No one here is named ${search}`},
                             message.threadID);
    } else if(targets.length > 1) {
      let intro = `Ambiguous statement. ` +
        `I found the following matches for ${search}:`;

      let body = _.reduce(targets, (acc, user) => acc + '\n' + user.name, intro);
      return api.sendMessage({body: body}, message.threadID);
    } else {
      let user = targets[0];

      Users.listPerms(message.threadID, user.id, (perms) => {
        let intro = `${user.name} has these permissions:`;
        let body = _.reduce(perms, (acc, perm) => acc + '\n' + perm, intro);
        api.sendMessage({body: body}, message.threadID);
      });
    }
  });
};
