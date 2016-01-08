'use strict';

const safeEval = require('safe-eval')
const Users = require('./../utilities/users');

let context = {fart: () => "toot!"}

module.exports.command = 'eval';

module.exports.handler = (api, args, message) => {
  Users.hasPerm(message.threadID, message.senderID, 'h4x0r', (result) => {
    if(!result) {
      return api.sendMessage({body: `I'm sorry ${message.senderName}, I'm` +
                            ` afraid I can't let you do that`},
                             message.threadID);
    }

    let cmd = args.join(' ');

    api.sendMessage({body: safeEval(cmd, context)}, message.threadID);
  });
};
