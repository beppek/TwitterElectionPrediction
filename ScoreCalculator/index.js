const fs = require('fs');

const sentimentData = './SentimentAnalysis/data';
const pollData = './PollCrawler/data';
const oddsData = './OddsData';

// Data dir
fs.readdirSync(sentimentData).forEach((party) => {
  let partyPromises = [];
  // Party dir
  fs.readdirSync(`${sentimentData}/${party}`).forEach((file) => {
    // partyPromises.push(
      // new Promise((resolve, reject) => {
    fs.readFile(`${sentimentData}/${party}/${file}`, 'utf8', (err, data) => {
      if (err) throw err;
      const sentiments = JSON.parse(data);
      const score = sumSentiments(sentiments, party);
      const {
        negativeCount,
        // totalNegative,
        // totalPositive,
        positiveCount,
        tweetCount,
        totalScore,
        comparative
      } = score;
      const countScore = positiveCount - negativeCount;
      const averageScore = totalScore / tweetCount;
      // const addedScores = countScore + totalScore;
      const averagePositive = positiveCount / tweetCount;
      const averageComparative = comparative / tweetCount;
      console.log('******************************************');
      console.log('**--------------------------------------**');
      console.log(`Score for ${party}`);
      // console.log(score);
      console.log(`Tweet count: ${tweetCount}`);
      console.log(`Count score: ${countScore}`);
      console.log(`Total score: ${totalScore}`);
      console.log(`Comparative score: ${comparative}`);
      // console.log(`Added score: ${addedScores}`);
      console.log(`Average score: ${averageScore}`);
      console.log(`Average comparative: ${averageComparative}`);
      console.log(`Average positive: ${averagePositive}`);
      console.log('**--------------------------------------**');
      console.log('******************************************');
      console.log('\n');
      // saveSentiment(sentiments, party);
          // let sentiments = [];
          // if (!obj.error) {
          //   obj.results.forEach((tweet) => {
          //     // Stupid twitter object structure
          //     const text = tweet.extended_tweet
          //       ? tweet.extended_tweet.full_text
          //       : tweet.text;

          //     sentiments.push(sentiment(text));
          //   });
          // }
          // resolve(sentiments);
    });
      // })
    // );
  });

  // Promise.all(partyPromises).then((promises) => {
  //   let sentiments = [];
  //   promises.forEach((prom) => (sentiments = sentiments.concat(prom)));
  //   console.log(sentiments.length);
  //   const score = sumSentiments(sentiments, party);
  //   const {
  //     negativeCount,
  //     // totalNegative,
  //     // totalPositive,
  //     positiveCount,
  //     tweetCount,
  //     totalScore
  //   } = score;
  //   const countScore = positiveCount - negativeCount;
  //   const addedScores = countScore + totalScore;
  //   const averagePositive = positiveCount / tweetCount;
  //   console.log('******************************************');
  //   console.log('**--------------------------------------**');
  //   console.log(`Score for ${party}`);
  //   // console.log(score);
  //   console.log(`Tweet count: ${tweetCount}`);
  //   console.log(`Count score: ${countScore}`);
  //   console.log(`Total score: ${totalScore}`);
  //   console.log(`Added score: ${addedScores}`);
  //   console.log(`Average positive: ${averagePositive}`);
  //   console.log('**--------------------------------------**');
  //   console.log('******************************************');
  //   console.log('\n');
  //   saveSentiment(sentiments, party);
  // });
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
  let comparative = 0;
  let tweetCount = sentiments.length;
  sentiments.forEach((sentiment) => {
    sentiment.score > 0
      ? ((positiveCount += 1), (totalPositive += sentiment.score))
      : ((negativeCount += 1), (totalNegative += sentiment.score));
    totalScore += sentiment.score;
    comparative += sentiment.score * sentiment.comparative;
  });
  return {
    party,
    positiveCount,
    totalPositive,
    negativeCount,
    totalNegative,
    totalScore,
    comparative,
    tweetCount
  };
}
