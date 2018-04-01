const cheerio = require('cheerio');
const rp = require('request-promise');
const fs = require('fs');
const moment = require('moment');

// TODO: Get from command line?
getResults('mars');
module.exports = getResults;

/**
 * Returns the latest polling results
 * @param {string} month
 * @return {Object} Object with the results for the 3 largest parties
 */
async function getResults(month) {
  const HTML = await getHTML();
  const results = extractResults(HTML, month);
  saveFile('AllPolls', results);
  const score = calcAverage(results);
  saveFile('Average', score);
  return score;
}

/**
 * Gets the HTML from the polling site
 *
 * @return {Promise} Promise containing the HTML as a string
 */
function getHTML() {
  return new Promise((resolve, reject) => {
    rp('https://github.com/hjnilsson/SwedishPolls/blob/master/Data/Polls.csv')
      .then((html) => {
        resolve(html);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * Extracts the results for 3 largest parties from the html
 *
 * @param {string} HTML
 * @param {string} month
 * @return {Object}
 */
function extractResults(HTML, month) {
  const $ = cheerio.load(HTML);
  const tbody = $('tbody');
  let latest = [];
  let rows = tbody.children();
  rows = rows.slice(0, 15);
  rows.each((i, row) => {
    const date = row.children[3].children[0].data;
    if (date === `2018-${month}`) {
      const company = row.children[5].children[0].data;
      const m = row.children[7].children[0].data;
      const socialdemokrat = row.children[15].children[0].data;
      const sdriks = row.children[21].children[0].data;
      latest.push({
        company,
        socialdemokrat,
        nya_moderaterna: m,
        sdriks
      });
    }
  });
  return latest;
}

/**
 * Calculates the average polling results
 *
 * @param {Object} results
 * @return {Object} with average score
 */
function calcAverage(results) {
  let totalM = 0;
  let totalS = 0;
  let totalSD = 0;
  const {length} = results;

  results.forEach((res) => {
    totalM += parseFloat(res.nya_moderaterna);
    totalS += parseFloat(res.socialdemokrat);
    totalSD += parseFloat(res.sdriks);
  });

  return {
    nya_moderaterna: totalM / length,
    sdriks: totalSD / length,
    socialdemokrat: totalS / length
  };
}

/**
 * saves the file
 *
 * @param {string} filename
 * @param {Object} data
 * @return {Promise}
 */
function saveFile(filename, data) {
  return new Promise((resolve, reject) => {
    moment.locale('sv');
    const timestamp = moment().format('L');
    fs.writeFile(
      `./PollCrawler/data/${filename}-${timestamp}.json`,
      JSON.stringify(data),
      'utf8',
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(`Successfully saved ${filename}`);
        }
      }
    );
  });
}
