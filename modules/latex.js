'use strict';

/**
 * Simple example middleware.
 * Shows how middlewares are composed of several variables and functions:
 * - onInit: Run on initialization of the Facebook API
 * - onMessage: Run whenever a non-command is entered in a channel
 */

const _ = require('underscore');

const Mathmode = require('mathmode');

let LatexReader = function(text) {
  let curIndex = 0;

  let self = {
    next() {
      let first$ = text.indexOf('$', curIndex);

      if(first$ < 0) return '';

      let next$ = text.indexOf('$', first$ + 1);

      while(next$ === text.indexOf('\$', first$ + 1) + 1) {
        if(next$ < 0) return '';

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

    let cur = reader.next();

    while(cur != '') {
      let msg = {
        attachment: Mathmode(cur, {packages: ["amsmath", "amssymb"]})
      }

      api.sendMessage(msg, id);

      cur = reader.next();
    }
  }
};
