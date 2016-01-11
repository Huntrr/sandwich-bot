'use strict';

/**
 * Simple example middleware.
 * Shows how middlewares are composed of several variables and functions:
 * - onInit: Run on initialization of the Facebook API
 * - onMessage: Run whenever a non-command is entered in a channel
 */

const _ = require('underscore');
const fs = require('fs');

const packages = ["amsmath", "amssymb"];

const Mathmode = require('mathmode');

let i = 0;
let nexti = () => {
  i++;
  return i;
};

let LatexReader = function(text) {
  let curIndex = 0;

  let self = {
    next() {
      let first$ = text.indexOf('$', curIndex);

      if(first$ < 0) return '';

      let next$ = text.indexOf('$', first$ + 1);

      while(text.charAt(next$ - 1) === '\\') {
        next$ = text.indexOf('$', next$ + 1);
      }

      if(next$ < 0) return '';

      curIndex = next$ + 1;

      return text.substring(first$ + 1, next$);
    }
  };

  return self;
};

module.exports.onMessage = (api, message) => {
  let id = message.threadID;

  if(message.type === 'message' && /\$(\\\$|[^\$])+\$/.test(message.body)) {
    let reader = LatexReader(message.body);

    let postNextEquation = function(cur) {
      if(cur === '') return;
      
      let filename = __dirname + `/../tmp/file${nexti()}.png`;
      Mathmode(cur, { packages: packages })
        .pipe(fs.createWriteStream(filename))
        .on('finish', () => {
          let msg = {
            attachment: fs.createReadStream(filename)
          };

          api.sendMessage(msg, id, () => postNextEquation(reader.next()));

          fs.unlink(filename, function(err) {
            if(err) return console.error(err);
          });
        });
    }

    postNextEquation(reader.next());
  }
};
