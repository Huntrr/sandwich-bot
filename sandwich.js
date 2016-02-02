'use strict';

require('console.table');

// imports
const path = require('path');
const _ = require('underscore');
const fs = require('fs');
const bot = require('./bot/bot');
const config = require('./bot/config');

// documentation
let docs = [];

// load all modules in `modules` subfolder
let moduleFolder = path.join(__dirname, 'modules');

fs.readdirSync(moduleFolder).forEach(function(file) {
  let splitFile = file.split('.');
  let extension = splitFile[splitFile.length - 1];
  
  // only load valid .js files
  if(_.contains(['js', 'es6', 'jsx', 'coffee'], extension)) {
    let middleware = require("./modules/" + file);
  
    if(middleware.onInit) {
      // onInit is optional
      bot.init(middleware.onInit);
    }

    if(middleware.onMessage) {
      bot.addModule(middleware.onMessage);
    } else {
      console.error(`./modules/${file} is invalid middleware; no onMessage`);
    }
  }
});

// load all commands in `commands` subfolder
let commandFolder = path.join(__dirname, 'commands');

fs.readdirSync(commandFolder).forEach(function(file) {
  let splitFile = file.split('.');
  let extension = splitFile[splitFile.length - 1];
  
  // only load valid .js files
  if(_.contains(['js', 'es6', 'jsx', 'coffee'], extension)) {
    let command = require("./commands/" + file);

    if(command.command && _.isFunction(command.handler)) {
      if(command.onInit) {
        bot.init(command.onInit);
      }

      if(command.usage && command.description) {
        // add documentation
        docs.push(
          `${config.commandCharacter}${command.command} ${command.usage}` +
          ` - ${command.description}`
        );
      }

      bot.addCommand(command.command, command.handler);
    } else {
      console.error(`./commands/${file} is invalid`);
    }
  }
});


// The help command
bot.addCommand('help', (api, args, message) => {
  let intro = `Hi! I'm ${config.name}. Here are my commands:`;
  api.sendMessage(_.reduce(docs, (acc, doc) => acc + '\n' + doc, intro),
                  message.threadID);
});


console.log('All set!');
