//const fetch = require('node-fetch');
//const fetch = require('fetch');
//require('node-fetch');
//import {fetch} from 'node-fetch';
//import fetch from 'node-fetch';

const fetch = require('node-fetch');

const Stock = require('./models/stockModel');

const { ALPHA_VANTAGE_KEY } = require('./keys');

const API_KEY = ALPHA_VANTAGE_KEY;
const DATATYPE = 'json';
const OUTPUT_SIZE = 'compact';
const API_LINK = 'https://www.alphavantage.co/query?';
const FIVE_MINUTES = 300000;

// https://www.alphavantage.co/documentation/
/*
    stuff to add:
    interval 
    outputSize

    any other useful optional stuff
    
*/

/**
 * Helper function that handles all API calls.
 *
 * This function SHOULD NOT be explicitly called outside of its ORIGINAL FILE.
 *
 * @param {string} functionString string of the API function name
 * @param {string} equitySymbol string of the equity's symbolised name.
 * @param {string} optionalParams string of other / optional parameters given from the functions listed below this one.
 *
 * @return JavaScript Object - "JSON" data
 */
const requestHelper = async function (
  functionString,
  equitySymbol,
  optionalParams = ''
) {
  let url = `${API_LINK}function=${functionString}&symbol=${equitySymbol}${optionalParams}&apikey=${API_KEY}`;
  if (equitySymbol == '') {
    url = `${API_LINK}function=${functionString}${optionalParams}&apikey=${API_KEY}`;
  } else if (functionString == 'SYMBOL_SEARCH') {
    url = `${API_LINK}function=${functionString}&keywords=${equitySymbol}${optionalParams}&apikey=${API_KEY}`;
  }
  /*
  redundant - pretty sure this is identical to above.
  else if (functionString == 'SYMBOL_SEARCH') {
    url = `${API_LINK}function=${functionString}&keywords=${equitySymbol}${optionalParams}&apikey=${API_KEY}`;
  }
  */

  /**
   * The following piece of code aims to reduce the number of api calls
   */

  // Key for database
  const key = {
    functionString: functionString,
    equitySymbol: equitySymbol,
    optionalParams: optionalParams,
  };

  // Search through previous api calls to the databse using key
  const query = await Stock.findOne(key, 'information updatedAt').exec();
  // If api call isn't in database make a new api call.
  if (query === null) {
    let response = await fetch(url);
    // Checking HTTP response
    if (!response.ok) {
      throw new Error(`HTTP error - status: ${response.status}`);
    }
    const information = await response.json();
    // If API call returns nothing and there is no saved call in the database, throw an error.
    if (Object.keys(information).length == 0) {
      throw new Error(`API error - No data is available for ${equitySymbol}`);
    }
    const body = { ...key, information: information };
    // Add api call to database
    let stock = new Stock(body);
    stock.save();
    return information;
  }

  const date = new Date(query.updatedAt);
  // If the stored api call hasn't been updated for more than 5 minutes make a new api call.
  if (Date.now() - date.getTime() > FIVE_MINUTES) {
    let response = await fetch(url);
    // Checking HTTP response
    if (!response.ok) {
      throw new Error(`HTTP error - status: ${response.status}`);
    }
    const information = await response.json();
    Stock.findOne(key, (err, result) => {
      // Check error
      if (err) {
        throw new Error(`Error accessing database`);
      }
      // If API call returns nothing and the call has been saved in the database, then return database value.
      if (Object.keys(information).length == 0) {
        return query.information;
      }
      // Update result
      result.information = information;
      result.save();
    });
    return information;
  }

  // Return stored api call
  return query.information;
};

/**
 * This API returns intraday time series of the equity specified, covering extended trading hours where applicable.
 *
 * This API returns the most recent 1-2 months of intraday data and is best suited for short-term/medium-term charting
 * and trading strategy development.
 *
 * @param {string} equitySymbol string of the equity's symbolised name.
 * @param {string} interval strings either '1min', '5min', '15min', '30min', or '60min'.
 * @param {string} adjusted Optional string parameter - default is 'true', 'false' returns unadjusted data.
 * @param {string} outputSize Optional string parameter - strings either 'compact' or 'full'. Default is 'compact', 'full' returns 20+ years of potential data.
 * @param {string} datatype Optional string parameter - strings either 'json' or 'csv'. Default is 'json', however 'csv' can be significantly faster.
 *
 * @returns JavaScript Object - "JSON" data
 */
const getIntraday = async function (
  equitySymbol,
  interval,
  adjusted = 'true',
  outputSize = OUTPUT_SIZE,
  datatype = DATATYPE
) {
  let otherParams = `&interval=${interval}&adjusted=${adjusted}&outputsize=${outputSize}&datatype=${datatype}`;

  let jsonData = await requestHelper(
    'TIME_SERIES_INTRADAY',
    equitySymbol,
    otherParams
  );
  return jsonData;
};

/**
 * This API returns raw (as-traded) daily time series of the global equity specified.
 * (date, daily open, daily high, daily low, daily close, daily volume)
 *
 * This can cover 20+ years of historical data.
 *
 * @param {string} equitySymbol string of the equity's symbolised name.
 * @param {string} outputSize Optional string Parameter - strings either 'compact' or 'full'. Default is 'compact', 'full' returns 20+ years of potential data.
 * @param {string} datatype  Optional string Parameter - strings either 'json' or 'csv'. Default is 'json', however 'csv' can be significantly faster.
 *
 * @returns JavaScript Object - "JSON" data - containing the
 * date, daily open, daily high, daily low, daily close, daily volume
 */
const getDaily = async function (
  equitySymbol,
  outputSize = OUTPUT_SIZE,
  datatype = DATATYPE
) {
  let otherParams = `&outputsize=${outputSize}&datatype=${datatype}`;
  let jsonData = await requestHelper(
    'TIME_SERIES_DAILY',
    equitySymbol,
    otherParams
  );
  return jsonData;
};

/**
 * This API returns raw (as-traded) daily open/high/low/close/volume values, daily adjusted close values, and historical split/dividend events of the global
 * equity specified, covering 20+ years of historical data.
 *
 * This can cover 20+ years of historical data.
 *
 * @param {string} equitySymbol string of the equity's symbolised name.
 * @param {string} outputSize Optional string Parameter - strings either 'compact' or 'full'. Default is 'compact', 'full' returns 20+ years of potential data.
 * @param {string} datatype  Optional string Parameter - strings either 'json' or 'csv'. Default is 'json', however 'csv' can be significantly faster.
 *
 * @returns JavaScript Object - "JSON" data - containing the
 * date, daily open, daily high, daily low, daily close, daily volume, daily adjusted close values, historical split/dividend events
 */
const getDailyAdjusted = async function (
  equitySymbol,
  outputSize = OUTPUT_SIZE,
  datatype = DATATYPE
) {
  let otherParams = `&outputsize=${outputSize}&datatype=${datatype}`;
  let jsonData = await requestHelper(
    'TIME_SERIES_DAILY_ADJUSTED',
    equitySymbol,
    otherParams
  );
  return jsonData;
};

/**
 * This API returns raw (as-traded) weekly time series of the global equity specified.
 * (last trading day of each week, weekly open, weekly high, weekly low, weekly close, weekly volume)
 *
 * This can cover 20+ years of historical data.
 *
 * @param {string} equitySymbol string of the equity's symbolised name.
 * @param {string} datatype  Optional string Parameter - strings either 'json' or 'csv'. Default is 'json', however 'csv' can be significantly faster.
 *
 * @return JavaScript Object - "JSON" data - containing the:
 *      last trading day of each week, weekly open, weekly high, weekly low, weekly close, weekly volume
 */
const getWeekly = async function (equitySymbol, datatype = DATATYPE) {
  let otherParams = `&datatype=${datatype}`;
  let jsonData = await requestHelper(
    'TIME_SERIES_WEEKLY',
    equitySymbol,
    otherParams
  );
  return jsonData;
};

/**
 * This API returns weekly adjusted time series (last trading day of each week, weekly open, weekly high, weekly low, weekly close, weekly adjusted close,
 * weekly volume, weekly dividend) of the global equity specified, covering 20+ years of historical data.
 *
 * This can cover 20+ years of historical data.
 *
 * @param {string} equitySymbol string of the equity's symbolised name.
 * @param {string} datatype  Optional string Parameter - strings either 'json' or 'csv'. Default is 'json', however 'csv' can be significantly faster.
 *
 * @return JavaScript Object - "JSON" data - containing the:
 *      last trading day of each week, weekly open, weekly high, weekly low, weekly close, weekly volume
 */
const getWeeklyAdjusted = async function (equitySymbol, datatype = DATATYPE) {
  let otherParams = `&datatype=${datatype}`;
  let jsonData = await requestHelper(
    'TIME_SERIES_WEEKLY_ADJUSTED',
    equitySymbol,
    otherParams
  );
  return jsonData;
};

/**
 * This API returns raw (as-traded) monthly time series of the global equity specified.
 * (last trading day of each month, monthly open, monthly high, monthly low, monthly close, monthly volume)
 *
 * This can cover 20+ years of historical data.
 *
 * @param {string} equitySymbol string of the equity's symbolised name.
 * @param {string} datatype  Optional string Parameter - strings either 'json' or 'csv'. Default is 'json', however 'csv' can be significantly faster.
 *
 * @return JavaScript Object - "JSON" data - containing the:
 *      last trading day of each month, monthly open, monthly high, monthly low, monthly close, monthly volume
 */
const getMonthly = async function (equitySymbol, datatype = DATATYPE) {
  let otherParams = `&datatype=${datatype}`;
  let jsonData = await requestHelper(
    'TIME_SERIES_MONTHLY',
    equitySymbol,
    otherParams
  );
  return jsonData;
};

/**
 * This API returns monthly adjusted time series (last trading day of each month, monthly open, monthly high, monthly low, monthly close, monthly
 * adjusted close, monthly volume, monthly dividend) of the equity specified, covering 20+ years of historical data.
 *
 * This can cover 20+ years of historical data.
 *
 * @param {string} equitySymbol string of the equity's symbolised name.
 * @param {string} datatype  Optional string Parameter - strings either 'json' or 'csv'. Default is 'json', however 'csv' can be significantly faster.
 *
 * @return JavaScript Object - "JSON" data - containing the:
 *      last trading day of each month, monthly open, monthly high, monthly low, monthly close, monthly volume
 */
const getMonthlyAdjusted = async function (equitySymbol, datatype = DATATYPE) {
  let otherParams = `&datatype=${datatype}`;
  let jsonData = await requestHelper(
    'TIME_SERIES_MONTHLY_ADJUSTED',
    equitySymbol,
    otherParams
  );
  return jsonData;
};

/**
 * A lightweight alternative to the time series APIs, this service returns the price and volume information for a security of your choice.
 *
 * @param {string} equitySymbol string of the equity's symbolised name.
 * @param {string} datatype  Optional string Parameter - strings either 'json' or 'csv'. Default is 'json', however 'csv' can be significantly faster.
 *
 * @return JavaScript Object - "JSON" data - containing the price and volume information.
 */
const getQuoteEndpoint = async function (equitySymbol, datatype = DATATYPE) {
  let otherParams = `&datatype=${datatype}`;
  let jsonData = await requestHelper('GLOBAL_QUOTE', equitySymbol, otherParams);
  return jsonData;
};

/**
 * The Search Endpoint returns the best-matching symbols and market information based on keywords of your choice. The search results also contain match
 * scores that provide you with the full flexibility to develop your own search and filtering logic.
 *
 * @param {string} textString string of the current name to search.
 * @param {string} datatype  Optional string Parameter - strings either 'json' or 'csv'. Default is 'json', however 'csv' can be significantly faster.
 *
 * THIS WILL RETURN THE FOLLOWING:
 * @return JavaScript Object - "JSON" data - containing symbols, market information, match scores
 */
const getSearchEndpoint = async function (textString, datatype = DATATYPE) {
  let otherParams = `&datatype=${datatype}`;
  let jsonData = await requestHelper('SYMBOL_SEARCH', textString, otherParams);
  return jsonData;
};

/**
 * This API returns the company information, financial ratios, and other key metrics for the equity
 * specified. Data is generally refreshed on the same day a company reports its latest earnings and
 * financials.
 *
 * @param {string} equitySymbol string of the equity's symbolised name.
 *
 * @return JavaScript Object - "JSON" data - containing key data related to the company.
 */
const getCompanyOverview = async function (equitySymbol) {
  let jsonData = await requestHelper('OVERVIEW', equitySymbol);
  return jsonData;
};

/**
 * This API returns the realtime exchange rate for a pair of digital currency (e.g., Bitcoin) and physical currency (e.g., USD).
 *
 * @param {string} from_currency string of the original currency
 * @param {string} to_currency string of the currency to exchange to
 *
 * @returns JavaScript Object - "JSON" data - containing the currencies symbols and names, the exchange rates, the bid and asking prices, the last refresh date
 */
const getExchangeRates = async function (from_currency, to_currency) {
  let otherParams = `&from_currency=${from_currency}&to_currency=${to_currency}`;
  let jsonData = await requestHelper(
    'CURRENCY_EXCHANGE_RATE',
    '', // Due to how the helper function is set up, this must be included.
    otherParams
  );

  return jsonData;
};

/**
 * This API returns the AROON_OSC indicator of the equity specified, covering extended trading hours where applicable.
 *
 * @param {string} equitySymbol string of the equity's symbolised name.
 * @param {string} interval strings either '1min', '5min', '15min', '30min', '60min', 'daily', 'weekly' or 'monthly'.
 * @param {number} time_period (optional) Number of data points used to calculate each AROONOSC value. Positive integers are accepted.
 *
 * @returns JavaScript Object - "JSON" data
 */
const getAROONOSC = async function (
  equitySymbol,
  interval = 'daily',
  time_period = 7
) {
  let otherParams = `&interval=${interval}&time_period=${time_period}`;

  let jsonData = await requestHelper('AROONOSC', equitySymbol, otherParams);
  return jsonData;
};

module.exports = {
  getIntraday,
  getDaily,
  getDailyAdjusted,
  getExchangeRates,
  getMonthly,
  getMonthlyAdjusted,
  getWeekly,
  getWeeklyAdjusted,
  getCompanyOverview,
  getQuoteEndpoint,
  getSearchEndpoint,
  getAROONOSC,
};

/*
// Leaving this here just in case.


const test = async () => {
  const temp = await getDaily('GME');
  console.log(temp);
};
test();
*/
