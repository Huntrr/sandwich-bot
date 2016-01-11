'use strict';

/**
 * Simple example middleware.
 * Shows how middlewares are composed of several variables and functions:
 * - onInit: Run on initialization of the Facebook API
 * - onMessage: Run whenever a non-command is entered in a channel
 */

const _ = require('underscore');

let listening = {};
let canListen = false;

const Cleverbot = require('cleverbot-node');
let bot = new Cleverbot;
Cleverbot.prepare(() => canListen = true);

module.exports.onMessage = (api, message) => {
  let id = message.threadID;

  if(!_.has(listening, id)) {
    listening[id] = false;
  }

  if(message.type === 'message') {
    if(message.body.toLowerCase() === 'wake up' && !listening[id]) {
      if(!canListen) {
        api.sendMessage({body: 'Zzzzzz... Not yet, mom!'}, message.threadID);
      } else {
        listening[id] = true;
        api.sendMessage({body: 'Good morning!'}, message.threadID);
      }
    } else if(message.body.toLowerCase() === 'shut up') {
      if(listening[id]) {
        listening[id] = false;
        api.sendMessage({body: '... Fine. Shutting up.'}, message.threadID);
      } else {
        api.sendMessage({body: 'I CAN\'T SHUT UP TWICE'}, message.threadID);
      }

    } else if(listening[id] && canListen) {
      bot.write(message.body, (response) => {
        console.log(`Cleverbot response: ${response}`);
        api.sendMessage({body: response.message}, message.threadID);
      });
    }
    
  }
};
