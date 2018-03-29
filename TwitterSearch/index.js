const secrets = require('./secrets');
const fs = require('fs');
const request = require('request');

const url = 'https://api.twitter.com/1.1/tweets/search/30day/val30.json';

const queries = ['sdriks', 'socialdemokrat', 'nya_moderaterna'];

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

  getTweets(
    config,
    {query: q, page: 0}
  )
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
        const timestamp = Date.now();
        const filename = `p${q.page}-${timestamp}.json`;
        fs.writeFile(
          `./data/twitter/${q.query}/${filename}`,
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
        if (tweets.next && q.page < 75) {
          config.body.next = tweets.next;
          q.page += 1;

          requests < 29 ? getTweets(config, q)
              .then((message) => {
                console.log(message);
              })
              .catch((err) => {
                console.log(err);
              }) : setTimeout(() => {
              requests = 0;
              getTweets(config, q)
                .then((message) => {
                  console.log(message);
                })
                .catch((err) => {
                  console.log(err);
                });
            }, 60000);
        }
      }
    });
  });
}
