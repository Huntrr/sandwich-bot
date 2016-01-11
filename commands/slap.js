
'use strict';

const findUser = require('./../utilities/findUser');
const _ = require('underscore');

module.exports.command = 'slap';

module.exports.usage = '<person to slap>';
module.exports.description = 'Slaps someone';

module.exports.handler = (api, args, message) => {
  if(args.length < 1) {
    api.sendMessage({body: `${message.senderName} got confused and slapped ` +
                     `themself!`}, message.threadID);
  }

  let search = args.join(' ');

  findUser(api, message, search, (targets) => {
    if(targets.length === 0) {
      return api.sendMessage({body: `No one here is named ${search}. ` +
                              `So ${message.sendName} slaps themself.`},
                             message.threadID);
    } else if(targets.length > 1) {
      let intro = `Ambiguous statement. ` +
        `I found the following matches for ${search}:`;

      let body = _.reduce(targets, (acc, user) => acc + '\n' + user.name,
                          intro);
      return api.sendMessage({body: body}, message.threadID);
    } else {
      let user = targets[0];

      api.sendMessage({body: `${message.senderName} slapped ${user.name}. ` +
                       (Math.random() > 0.5 ? 'Hard.' : '')},
                      message.threadID);
    }
  });

};
