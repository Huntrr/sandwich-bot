'use strict';

const _ = require('underscore');
const findUser = require('./../utilities/findUser');
const Users = require('./../utilities/users');

module.exports.command = 'listWithPerm';

module.exports.usage = '<perm to check>';
module.exports.description = 'Lists all users with a given permission';

module.exports.handler = (api, args, message) => {
  
  if(args.length < 1) {
    return api.sendMessage({body: 'Invalid form'},
                    message.threadID);
  }
    
  let perm = args[0].toLowerCase(); 
  Users.listUsersWithPerm(message.threadID, perm, (targets) => {
    let intro = `I found the following ${perm}s in this channel:`;

    let body = _.reduce(targets, (acc, user) => acc + '\n' + user, intro);
    return api.sendMessage({body: targets ? body : 'none'}, message.threadID);
  });
};
