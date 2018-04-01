const fs = require('fs');
const moment = require('moment');

const dataLocation = './data/twitter';
moment.locale('sv');

fs.readdirSync(dataLocation).forEach((party) => {
  let partyPromises = [];
  // Party dir
  fs.readdirSync(`${dataLocation}/${party}`).forEach((file) => {
    partyPromises.push(
      new Promise((resolve, reject) => {
        fs.readFile(`${dataLocation}/${party}/${file}`, 'utf8', (err, data) => {
          if (err) throw err;
          const obj = JSON.parse(data);
          let tweets = [];
          if (!obj.error) {
            obj.results.forEach((tweet) => {
              // Stupid twitter object structure
              const text = tweet.extended_tweet
                ? tweet.extended_tweet.full_text
                : tweet.text;
              const date = tweet.created_at;
              console.log(date);
              tweets.push({text, date});
            });
          }
          resolve(tweets);
        });
      })
    );
  });

  Promise.all(partyPromises).then((promises) => {
    let tweets = [];
    promises.forEach((prom) => (tweets = tweets.concat(prom)));
  });
});
