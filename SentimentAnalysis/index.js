// https://github.com/AlexGustafsson/sentiment-swedish
const sentiment = require('sentiment-swedish');
const fs = require('fs');
const moment = require('moment');

const dataLocation = './data/twitter';
// Data dir
fs.readdirSync(dataLocation).forEach((party) => {
  let partyPromises = [];
  // Party dir
  fs.readdirSync(`${dataLocation}/${party}`).forEach((file) => {
    partyPromises.push(
      new Promise((resolve, reject) => {
        fs.readFile(`${dataLocation}/${party}/${file}`, 'utf8', (err, data) => {
          if (err) throw err;
          const obj = JSON.parse(data);
          let sentiments = [];
          if (!obj.error) {
            obj.results.forEach((tweet) => {
              // Stupid twitter object structure
              const text = tweet.extended_tweet
                ? tweet.extended_tweet.full_text
                : tweet.text;

              sentiments.push(sentiment(text));
            });
          }
          resolve(sentiments);
        });
      })
    );
  });

  Promise.all(partyPromises).then((promises) => {
    let sentiments = [];
    promises.forEach((prom) => (sentiments = sentiments.concat(prom)));
    const score = sumSentiments(sentiments, party);
    const {
      negativeCount,
      // totalNegative,
      // totalPositive,
      positiveCount,
      tweetCount,
      totalScore
    } = score;
    const countScore = positiveCount - negativeCount;
    const addedScores = countScore + totalScore;
    const averagePositive = positiveCount / tweetCount;
    console.log('******************************************');
    console.log('**--------------------------------------**');
    console.log(`Score for ${party}`);
    // console.log(score);
    console.log(`Tweet count: ${tweetCount}`);
    console.log(`Count score: ${countScore}`);
    console.log(`Total score: ${totalScore}`);
    console.log(`Added score: ${addedScores}`);
    console.log(`Average positive: ${averagePositive}`);
    console.log('**--------------------------------------**');
    console.log('******************************************');
    console.log('\n');
    saveSentiment(sentiments, party);
  });
});

/**
 * Sums the sentiment scores
 *
 * @param {Object} sentiments
 * @param {string} party
 * @return {Object} sentiment sum result
 */
function sumSentiments(sentiments, party) {
  let positiveCount = 0;
  let negativeCount = 0;
  let totalPositive = 0;
  let totalNegative = 0;
  let totalScore = 0;
  let tweetCount = sentiments.length;
  sentiments.forEach((sentiment) => {
    sentiment.score > 0
      ? ((positiveCount += 1), (totalPositive += sentiment.score))
      : ((negativeCount += 1), (totalNegative += sentiment.score));
    totalScore += sentiment.score;
  });
  return {
    party,
    positiveCount,
    totalPositive,
    negativeCount,
    totalNegative,
    totalScore,
    tweetCount
  };
}

/**
 * Save the result to file
 *
 * @param {any} sentiment
 * @param {any} party
 */
function saveSentiment(sentiment, party) {
  moment.locale('sv');
  const timestamp = moment().format('L');
  const filename = `${party}/sentiment_analysis-${timestamp}.json`;
  fs.writeFile(
    `./SentimentAnalysis/data/${filename}`,
    JSON.stringify(sentiment),
    'utf8',
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Successfully saved ${filename}`);
      }
    }
  );
}
