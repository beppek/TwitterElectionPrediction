const fs = require('fs');
const math = require('mathjs');
const plotly = require('plotly')('Beppek', 'bAvV2yTYaVrFiB7RrnBh');

const sentimentData = './SentimentAnalysis/data';

readData();

/**
 * Read data dir
 */
function readData() {
  const promises = [];
  const grandTotal = {
    sdriks: {
      totalPositive: 0,
      allScores: [],
      comparativeScores: [],
      totalTweets: 0
    },
    nya_moderaterna: {
      totalPositive: 0,
      allScores: [],
      comparativeScores: [],
      totalTweets: 0
    },
    socialdemokrat: {
      totalPositive: 0,
      allScores: [],
      comparativeScores: [],
      totalTweets: 0
    }
  };
  fs.readdirSync(sentimentData).forEach((party) => {
    // Party dir
    fs.readdirSync(`${sentimentData}/${party}`).forEach((file) => {
      promises.push(
        new Promise((resolve, reject) => {
          // month file
          fs.readFile(
            `${sentimentData}/${party}/${file}`,
            'utf8',
            (err, data) => {
              if (err) throw err;
              const month = file.split('-')[1].split('.')[0];
              const sentiments = JSON.parse(data);
              const score = calcScores(sentiments, party);
              const {
                positiveCount,
                tweetCount,
                totalComparative,
                scores,
                compScores
              } = score;
              let {
                totalPositive,
                allScores,
                comparativeScores,
                totalTweets
              } = grandTotal[party];
              totalPositive += positiveCount;
              allScores = allScores.concat(scores);
              comparativeScores = comparativeScores.concat(compScores);
              totalTweets += tweetCount;
              grandTotal[party] = {
                totalPositive,
                allScores,
                comparativeScores,
                totalTweets
              };
              score.percentPositive = `${(
                positiveCount /
                tweetCount *
                100
              ).toFixed(1)}%`;
              score.averageComparative = totalComparative / tweetCount;
              resolve({score, party, month});
            }
          );
        })
      );
    });
  });
  Promise.all(promises).then((proms) => {
    let parties = {
      Socialdemokraterna: {},
      Moderaterna: {},
      Sverigedemokraterna: {}
    };
    proms.forEach(({score, party, month}) => {
      const partyName = getPartyName(party);
      parties[partyName][month] = {
        average: score.averageScore.toFixed(3),
        averageComparative: score.averageComparative.toFixed(3),
        tweetCount: score.tweetCount,
        percentPositive: score.percentPositive
      };
    });
    console.log(parties);
    calcAll(grandTotal, parties);
    console.log(parties);
    // makeGraph(parties);
  });
}

/**
 * Calculates all the scores
 * @param {Array} allScores
 * @param {Object} parties
 */
function calcAll(allScores, parties) {
  for (const party in allScores) {
    if (allScores.hasOwnProperty(party)) {
      const partyName = getPartyName(party);
      const scores = allScores[party];
      console.log(scores.totalPositive);
      const percentPositive = `${(
        scores.totalPositive /
        scores.allScores.length *
        100
      ).toFixed(1)}%`;
      parties[partyName]['Average'] = {
        average: math.mean(scores.allScores).toFixed(3),
        averageComparative: math.mean(scores.comparativeScores).toFixed(3),
        percentPositive,
        totalTweets: scores.totalTweets
      };
    }
  }
}

/**
 * Sums the sentiment scores
 *
 * @param {Object} sentiments
 * @param {string} party
 * @return {Object} sentiment sum result
 */
function calcScores(sent  iments, party) {
  let positiveCount = 0;
  let negativeCount = 0;
  let totalPositive = 0;
  let totalNegative = 0;
  let totalScore = 0;
  let totalComparative = 0;
  let highestScore = 0;
  let lowestScore = 0;
  let highestComp = 0;
  let lowestComp = 0;
  const scores = [];
  const compScores = [];
  let tweetCount = sentiments.length;
  sentiments.forEach((sentiment) => {
    const {score, comparative} = sentiment;
    score > 0
      ? ((positiveCount += 1), (totalPositive += score))
      : ((negativeCount += 1), (totalNegative += score));
    totalScore += score;
    totalComparative = (totalComparative * 100 + comparative * 100) / 100;
    scores.push(score);
    compScores.push(comparative);
    if (score > highestScore) {
      highestScore = score;
    }
    if (score < lowestScore) {
      lowestScore = score;
    }
    if (comparative > highestComp) {
      highestComp = score;
    }
    if (comparative < lowestComp) {
      lowestComp = score;
    }
  });
  const averageScore = totalScore / tweetCount;
  const stdDev = math.std(scores);
  const stdDevComp = math.std(compScores);
  const scoreMedian = math.median(scores);
  const compMedian = math.median(scores);
  return {
    party,
    positiveCount,
    totalPositive,
    negativeCount,
    totalNegative,
    totalScore,
    totalComparative,
    tweetCount,
    highestScore,
    lowestScore,
    highestComp,
    lowestComp,
    averageScore,
    stdDev,
    stdDevComp,
    scoreMedian,
    compMedian,
    scores,
    compScores
  };
}

/**
 * Gets twitter handle and returns party name
 * @param {string} party
 * @return {string}
 */
function getPartyName(party) {
  let partyName = '';
  switch (party) {
    case 'socialdemokrat':
      partyName = 'Socialdemokraterna';
      break;
    case 'nya_moderaterna':
      partyName = 'Moderaterna';
      break;
    case 'sdriks':
      partyName = 'Sverigedemokraterna';
    default:
      break;
  }
  return partyName;
}

/**
 * Calculates the median of all scores
 * @param {Array} scores
 * @return {Number} the median of all scores
 */
function median(scores) {
  scores.sort((a, b) => a - b);
  let median = 0;
  if (scores.length === 0) {
    return median;
  }
  let half = Math.floor(scores.length / 2);
  scores.length % 2
    ? (median = scores[half])
    : (scores[half - 1] + scores[half]) / 2;
  return median;
}

/**
 * Calculates the standard deviation of all scores
 * @param {Array} scores
 * @param {Number} avg
 * @return {Number} the standard deviation of all scores
 */
function standardDeviation(scores, avg) {
  let squareDiffs = scores.map((score) => {
    let diff = score - avg;
    let sqr = diff * diff;
    return sqr;
  });
  let sum = scores.reduce((sum, score) => {
    return sum + score;
  }, 0);

  let avgSqDiff = sum / scores.length;

  return Math.sqrt(avgSqDiff);
}

/**
 * Make a graph
 * @param {Object} parties
 * @param {string} type
 */
function makeGraph(parties, type) {
  const data = [];
  const colors = {
    Sverigedemokraterna: '#ffff2b',
    Socialdemokraterna: '#ff6633',
    Moderaterna: '#3369ff'
  };
  for (const name in parties) {
    if (parties.hasOwnProperty(name)) {
      const party = parties[name];
      data.push({
        x: ['March', 'April', 'May'],
        y: [party['March'][type], party['April'][type], party['May'][type]],
        name,
        type: 'bar',
        marker: {color: colors[name]}
      });
    }
  }
  const layout = {
    barmode: 'group',
    bargap: 0.15,
    bargroupgap: 0.1
  };
  const graphOptions = {
    layout: layout,
    filename: 'grouped-bar',
    fileopt: 'overwrite'
  };
  plotly.plot(data, graphOptions, (err, msg) => {
    console.log(msg);
  });
  // console.log(data);
}
