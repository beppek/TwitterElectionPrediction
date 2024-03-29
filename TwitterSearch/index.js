const secrets = require('./secrets');
const fs = require('fs');
const request = require('request');
const moment = require('moment');
moment.locale('sv');

const url = 'https://api.twitter.com/1.1/tweets/search/30day/val30.json';

const queries = ['sdriks', 'socialdemokrat', 'nya_moderaterna'];

const month = 'May';

let requests = 0;

queries.forEach((q) => {
  const config = {
    headers: {
      // 'Authorization': `Bearer ${res.data.access_token}`,
      'content-type': 'application/json'
    },
    url,
    oauth: {
      consumer_key: secrets.consumerKey,
      consumer_secret: secrets.consumerSecret,
      access_token_key: secrets.accessToken,
      access_token_secret: secrets.accessTokenSecret
    },
    json: true,
    body: {
      query: `@${q}`
    }
  };

  getTweets(config, {query: q, page: 0})
    .then((message) => {
      console.log(message);
    })
    .catch((err) => {
      console.log(err);
    });
});

/**
 * Gets tweets from the endpoint
 * @param {Object} config
 * @param {String} q
 * @return {Promise} Promise
 */
function getTweets(config, q) {
  requests += 1;
  return new Promise((resolve, reject) => {
    request.post(config, (err, res, tweets) => {
      if (err) {
        reject(err);
      } else {
        const timestamp = moment().format('L');
        const filename = `p${q.page}-${timestamp}.json`;
        fs.writeFile(
          `./data/twitter/${month}/${q.query}/${filename}`,
          JSON.stringify(tweets),
          'utf8',
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(`Successfully saved ${filename}`);
            }
          }
        );
        if (tweets.next && q.page < 38) {
          config.body.next = tweets.next;
          q.page += 1;

          requests < 21
            ? getTweets(config, q)
                .then((message) => {
                  console.log(message);
                })
                .catch((err) => {
                  console.log(err);
                })
            : setTimeout(() => {
                requests = 0;
                getTweets(config, q)
                  .then((message) => {
                    console.log(message);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }, 65000);
        }
      }
    });
  });
}
