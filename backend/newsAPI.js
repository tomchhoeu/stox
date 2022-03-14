const fetch = require('node-fetch');
const { getCompanyOverview } = require('./alphaVantageAPI.js');

const { NEWS_API_KEY } = require('./keys');

// https://newsapi.org/docs/endpoints/top-headlines

const API_KEY = NEWS_API_KEY;
const CATEGORY = 'business';
const COUNTRY = 'us';
const N_RES = 20;
const API_LINK = 'https://newsapi.org/v2';
const LAN = 'en';
const millis_month = 2629800000;
const millis_day = 86400000;
const MAX_LEN = 255;
const fs = require('fs').promises;

var Sentiment = require('sentiment');
var sentiment = new Sentiment();
var dir = 'news_storage';

/**
 * Function that gets the top headlines from a specific category.
 *
 * @param {string} searchTerm what to search (default '').
 * @param {string} category what category to search in (default 'business', can be none).
 * @param {string} country what country to get news from (default 'us', can be none).
 * @param {number} numResults how many results to display (default 20, must be integer)
 *
 * @return JavaScript Object - "JSON" data
 */
const getTopHeadlines = async function (
  searchTerm = '',
  category = CATEGORY,
  country = COUNTRY,
  numResults = N_RES
) {
  // let url = `${API_LINK}/top-headlines?country=${country}&category=${category}&`
  let url = `${API_LINK}/top-headlines?language=${LAN}&pageSize=${numResults}`;

  if (searchTerm !== '') {
    url += `&q=${searchTerm}`;
  }
  if (category !== '') {
    url += `&category=${category}`;
  }
  if (country !== '') {
    url += `&country=${country}`;
  }

  url += `&apiKey=${API_KEY}`;

  const fname = 'top_headlines.txt';
  return openOrGet(url, fname);
};

/**
 * Function that gets all news from a time period for a certain searchterm.
 *
 * @param {string} searchTerm what to search (required).
 * @param {string} sortBy how to sort the results, default 'publishedAt', can be 'relevancy' or 'popularity'
 * @param {number} since what time period to get results from in days, default 7, max 30
 * @return JavaScript Object - "JSON" data
 */

const getEverything = async function (
  searchTerm,
  sortBy = 'publishedAt',
  since = 7
) {
  const toDateStr = function (d) {
    const date_str =
      d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    return date_str;
  };

  const time_since = (millis_month * since) / 30;
  const epochDate = Date.now();
  const date_str = toDateStr(new Date(epochDate - time_since));

  // API allows for searching with boolean operators, breaks if those exist in stock info so replace them
  searchTerm = searchTerm.replace(/AND|\&/, 'and');

  let url = `${API_LINK}/everything?language=${LAN}&q=${searchTerm}&from=${date_str}&sortBy=${sortBy}&apiKey=${API_KEY}`;

  const split_search = searchTerm.split(' OR');
  let fname = '';
  for (let i = 0; i < split_search.length; i += 2) {
    fname += split_search[i];
  }
  fname += '.txt';
  if (fname.length > MAX_LEN) {
    fname = fname.slice(0, MAX_LEN);
    console.log('filename too long, trimming...');
  }

  return await openOrGet(url, fname.split(' ').join('+'));
};

/**
 * Function that gets simple sentiment of a stock.
 *
 * @param {string} stock_code the stock to analyse sentiment of
 *
 * @return JavaScript Object containing sentiment and article stats
 */

const getSentiments = async function (stock_code) {
  const getQuery = async () => {
    const overview = await getCompanyOverview(stock_code);
    const q = overview.Symbol + ' OR "' + overview.Name + '"';
    return q;
  };

  try {
    return getQuery().then((q) => {
      return getEverything((searchTerm = q), (sortBy = 'relevancy')).then(
        (r) => {
          const articles = r.articles;
          const seen_titles = [];
          const seen_sources = [];
          let sen = 0;
          let n_pos = 0;
          let n_neg = 0;
          let n_neu = 0;
          let n_uni = 0;
          Object.values(articles).forEach((val) => {
            let first_title = val.title.split(' ').slice(0, 2);
            first_title = first_title[0] + first_title[1];

            // check if we've seen this title before
            if (seen_titles.indexOf(first_title) === -1) {
              const src = val.source.name;
              // check if this source is unique
              if (seen_sources.indexOf(src) === -1) {
                seen_sources.push(src);
                n_uni += 1;
              }
              seen_titles.push(first_title);
              const txt = val.title + ' ' + val.content;
              const score = sentiment.analyze(txt).score;
              sen += score;
              n_pos += score >= 1 ? 1 : 0;
              n_neg += score <= -1 ? 1 : 0;
              n_neu += score < 1 && score > -1 ? 1 : 0;
            }
          });
          const n_tot = n_pos + n_neg + n_neu;
          return {
            sen,
            n_pos,
            n_neg,
            n_neu,
            n_tot,
            n_uni,
          };
        }
      );
    });
  } catch (err) {
    console.log('Failed to get sentiment:', err);
    return {};
  }
};

/**
 * Function that gets data from file or from API if file is too old/nonexistant
 *
 * @param {string} url the url to fetch new data from
 * @param {string} fname the name of the file to read/write to
 *
 * @return JSON of the request result
 */

const openOrGet = async function (url, fname) {
  return needNewData(fname).then(async (x) => {
    if (x) {
      let response = await fetch(url);
      if (!response.ok) {
        console.log(`HTTP error - status: ${response.status}`);
        return {};
      }
      await response.json().then((x) => {
        const txt_and_date = Date.now() + '#TIMESTAMP' + JSON.stringify(x);
        fs.writeFile(`news_storage/${fname}`, txt_and_date).then((err) => {
          if (err) {
            console.log('failed to write:', err);
          }
        });
      });
    }
    const filedata = await fs
      .readFile(`news_storage/${fname}`, 'utf-8')
      .then((x) => {
        console.log('Reading news from file', fname);
        const content = x.split('#TIMESTAMP')[1];
        return JSON.parse(content);
      });
    return await filedata;
  });
};

/**
 * Function to make a dir if it doesn't exist
 */

const dirExists = async function () {
  fs.access(dir)
    .then()
    .catch((err) => {
      console.log('creating dir...');
      fs.mkdir(dir);
    });
};

/**
 * Function that checks whether new newsdata is required
 *
 * @param {string} fname the name of the file to check
 *
 * @return Boolean
 */

const needNewData = async function (fname) {
  dirExists();
  const epoch_time = Date.now();
  return await fs
    .readFile(`news_storage/${fname}`, 'utf-8')
    .then((res) => {
      const file_time = res.split('#TIMESTAMP')[0];
      // If news is more than half a day old, get new news.
      return epoch_time - file_time > millis_day / 2 ? true : false;
    })
    .catch((err) => {
      console.log('read failed with code', err.code, 'creating file');
      return true;
    });
};

module.exports = {
  getTopHeadlines,
  getEverything,
  getSentiments,
};
