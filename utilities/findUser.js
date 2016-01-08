'use strict';

let _ = require('underscore');

/*
 * Finds a user in a thread based on a given search term
 */

module.exports = (api, message, search, cb) => {
  let result = [];

  api.getUserInfo(message.participantIDs, (err, users) => {
    if(err) return console.error(err);

    _.each(users, (user, id) => {
      if(user.name.toLowerCase().indexOf(search.toLowerCase()) > -1) {
        result.push({name: user.name, id: id});
      }
    });

    return cb(result);
  });
};


