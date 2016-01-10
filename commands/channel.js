'use strict';

/**
 * Channel management commands:
 * - /channel join <name> [<password>]
 * - /channel leave
 * - /channel list
 * - /channel getname
 * - /channel setname <name>
 * - /channel setprivate
 * - /channel setpublic
 * - /channel setpassword <password>
 */

const _ = require('underscore');
const findUser = require('./../utilities/findUser');
const Users = require('./../utilities/users');
const Channels = require('./../utilities/channels');

module.exports.command = 'channel';

module.exports.usage = 'join <name> [<password>]\n' +
                       '/channel leave\n' +
                       '/channel list\n' +
                       '/channel setname <name>\n' +
                       '/channel getname\n' +
                       '/channel setdesc <desc>\n' +
                       '/channel getdesc\n' +
                       '/channel setprivate\n' +
                       '/channel setpublic\n' +
                       '/channel setpassword <password>';
module.exports.description = 'Manages channels';

module.exports.handler = (api, args, message) => {
  Users.hasPerm(message.threadID, message.senderID, "mod", (isMod) => {
    if(args.length < 1) {
      return api.sendMessage({body: 'Ambiguous command.'},
                      message.threadID);
    }

    let cmd = args[0].toLowerCase();
    args.shift();

    switch (cmd) {
      case "join":
        if(args.length < 1) {
          return api.sendMessage( {body: "Enter a channel to join"},
                                 message.senderID);
        }

        let channelName = args[0];
        if(args.length > 1) {
          let password = args[1];
          Channels.joinChannel(api, channelName, message.senderID, password);
        } else {
          Channels.joinChannel(api, channelName, message.senderID);
        }
        break;

      case "leave":
        Channels.leaveChannel(api, message.threadID, message.senderID);
        break;

      case "list":
        Channels.getChannelList( (list) => {
          let intro = 'These are all the public channels I found:'
          let body = _.reduce(list, (acc, chan) => `${acc}\n${chan}`, intro);
          api.sendMessage( {body: body}, message.threadID);
        });
        break;

      case "getname":
        Channels.getChannelName(message.threadID, (name) => {
          api.sendMessage( {body: `This channel is named ${name}`},
                          message.threadID);
        });
        break;

      case "setname":
        if(!isMod) {
          return api.sendMessage( {body: "I'm afraid you don't have" +
                                 " permission to do that."}, message.threadID);
        }
      
        if(args.length < 1) {
          return api.sendMessage( {body: "Enter a new name please"},
                                 message.senderID);
        }
        let newName = args[0];

        Channels.setChannelName(message.threadID, newName, api);
        break;

      case "setdesc":
        if(!isMod) {
          return api.sendMessage( {body: "I'm afraid you don't have" +
                                 " permission to do that."}, message.threadID);
        }
      
        if(args.length < 1) {
          return api.sendMessage( {body: "Enter a new name please"},
                                 message.senderID);
        }
        
        let newDesc = args.join(' ');

        Channels.setChannelDesc(message.threadID, newDesc);
        api.sendMessage({body: `Setting description to "${newDesc}"`},
                        message.threadID);
        break;

      case "getdesc":
        Channels.getChannelDesc(message.threadID, (desc) => {
          api.sendMessage( {body: `Channel Description: ${desc}`},
                          message.threadID);
        });
        break;

      case "setprivate":
        if(!isMod) {
          return api.sendMessage( {body: "I'm afraid you don't have" +
                                 " permission to do that."}, message.threadID);
        }
      
        Channels.setChannelPrivate(message.threadID, true);
        api.sendMessage({body: "Making channel private"}, message.threadID);
        break;

      case "setpublic":
        if(!isMod) {
          return api.sendMessage( {body: "I'm afraid you don't have" +
                                 " permission to do that."}, message.threadID);
        }
      
        Channels.setChannelPrivate(message.threadID, false);
        api.sendMessage({body: "Making channel public"}, message.threadID);
        break;

      case "setpassword":
        if(!isMod) {
          return api.sendMessage( {body: "I'm afraid you don't have" +
                                 " permission to do that."}, message.threadID);
        }
      
        let newPass = "";
        if(args.length > 0) {
          newPass = args[0];
          console.log("NEW PASSWORD: " + newPass);
        }

        Channels.setChannelPassword(message.threadID, newPass);
        api.sendMessage({body: "Setting password"}, message.threadID);
        break;

      default:
        return api.sendMessage({body: 'Unknown channel command, try /help'},
                               message.senderID);
        break;
    }

  });
};
