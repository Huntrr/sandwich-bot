'use strict';

// imports
const facebook = require("facebook-chat-api");
const _ = require("underscore");

// config
const config = require("./config");

// (closured) middleware
let middlewares = [];
let commands = [];

let initials = [];
let initialized = false;
let _api = null;

facebook(config.credentials, (err, api) => {
  if(err) return console.error(err);

  let kill = api.listen(function botListen(err, message) {
    if(err) return console.error(err);


    if(message.type === 'message' &&
       message.body.charAt(0) === config.commandCharacter) {
        let msg = message.body.substring(1);
        let args = msg.split(' ');
        let cmd = args[0];
        args.shift();

        _.each(commands, (command) => {
          if(command.cmd === cmd) {
            // the command matches
            command.handler(api, args, message);
          }
        });
    } else {
      // runs each middleware with the API as the first argument, MESSAGE as next
      _.each(middlewares, (middleware) => middleware(api, message));
    }

  });

  _.each(initials, (initial) => initial(api));
  initialized = true;
  _api = api;

});

module.exports.addModule = (func) => {
  if(_.isFunction(func)) {
    middlewares.push(func);
  } else {
    console.error(`Invalid module. ${func} is not a function`);
  }
};

module.exports.addCommand = (command, handler) => {
  if(_.isFunction(handler)) {
    commands.push({cmd: command, handler: handler});
  } else {
    console.error(`Invalid command. ${handler} is not a function`);
  }
};

// adds a function to be executed on initialization
module.exports.init = (func) => {
  if(!_.isFunction(func)) {
    return console.error(`Invalid initializer. ${func} is not a function`);
  }

  if(initialized) {
    func(_api);
  } else {
    initials.push(func);
  }
};
  
