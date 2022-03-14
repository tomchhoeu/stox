const express = require('express');
const {
  getDaily,
  getSearchEndpoint,
  getQuoteEndpoint,
  getCompanyOverview,
  getIntraday,
  getAROONOSC,
} = require('../alphaVantageAPI');
const router = express.Router();

const trending_stocks_controller = require('../controllers/trendingStockController');
const general_helpers = require('../helpers/generalControllerHelpers');

// @route   GET auth
// @desc    Test route
// @access  Public
/*
router.get('/:code', (req, res) => {
  const stock_code = req.params.code
  console.log('/stock called! ' + stock_code);
  res.send('Stock route ' + stock_code);
});
*/

// @route   GET stock/:code
// @desc    Gets data for a stock
// @access  Public
// @return  {code, name, currency, sector, open, high, low, price, volume, prev_close, change, change_percent}
router.get('/:code', (req, res) => {
  const stock_code = req.params.code;
  console.log('Received current stock data request for:', stock_code);

  // asynchronous function for getting data
  const retrieveResults = async () => {
    try {
      const quote = await getQuoteEndpoint(stock_code);
      const overview = await getCompanyOverview(stock_code);

      // console.log(overview);
      // console.log(quote);

      const code = stock_code;
      const name = overview['Name'];
      const currency = overview['Currency'];
      const sector = overview['Sector'];

      const open = quote['Global Quote']['02. open'];
      const high = quote['Global Quote']['03. high'];
      const low = quote['Global Quote']['04. low'];
      const price = quote['Global Quote']['05. price'];
      const volume = quote['Global Quote']['06. volume'];
      const prev_close = quote['Global Quote']['08. previous close'];
      const change = quote['Global Quote']['09. change'];
      const change_percent = quote['Global Quote']['10. change percent'];

      const payload = {
        code,
        name,
        currency,
        sector,
        open,
        high,
        low,
        price,
        volume,
        prev_close,
        change,
        change_percent,
      };

      return res.status(200).json(payload);
    } catch (err) {
      console.log(`Stock code that experienced this error was ${stock_code}.`);
      console.log('1');
      console.log(err);
      return res.status(400).json({ err });
    }
    //return res.status(404);
  };

  try {
    retrieveResults();
  } catch (err) {
    console.log(err);
    console.log('2');
    return res.status(400).json({ err });
  }
});

// @route   GET stock/history/:code
// @desc    Gets past history/performance of a stock
// @access  Public
// @return  time_series, data_series
router.get('/history/:code', (req, res) => {
  // Receieve stock code from frontend
  const stock_code = req.params.code;

  // Retrieve intraday data for specific stock code
  const retrieveHistory = async () => {
    const raw_intraday = await getIntraday(stock_code, '60min');

    // Map closing data to time series
    let time_series = [];
    try {
      time_series = Object.keys(raw_intraday['Time Series (60min)']);
    } catch (e) {
      console.log(e);
    }

    let data_series = [];
    // process raw intraday data
    for (const entry of time_series) {
      data_series.push(
        parseFloat(raw_intraday['Time Series (60min)'][entry]['4. close'])
      );
    }

    // Reverse series data
    time_series.reverse();
    data_series.reverse();

    // Create payload
    const payload = {
      time_series,
      data_series,
    };

    // Send response
    return res.status(200).json(payload);
  };

  try {
    retrieveHistory();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ err });
  }
});

// @route   GET stock/search/:text
// @desc    Searches for a stock CODE based on search text
// @access  Public
router.get('/search/:text', (req, res) => {
  const text = req.params.text;
  console.log('Recieved search request for:', text);

  // asynchronous function for getting data
  const retrieveResults = async () => {
    const results = await getSearchEndpoint(text);

    const codes = [];

    //console.log(results);
    for (const match of results.bestMatches) {
      try {
        if ((await general_helpers.checkIfStock(match['1. symbol'])) == true) {
          //console.log(match);
          codes.push(match['1. symbol']);
        }
      } catch (err) {
        console.log(err);
      }
    }
    console.log(codes);

    // construct payload
    const payload = {
      codes,
    };
    // console.log(req.body.token);
    // console.log(req.query.token);
    // console.log(req.headers['x-access-token']);
    return res.status(200).json(payload);
  };

  try {
    retrieveResults();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ err });
  }
});

// @route   POST stock/trending/create
// @desc    Create a new trending stock, if it doesn't exist already
// @access  Public
router.post('/trending/create', trending_stocks_controller.createTrendingStock);

// @route   POST stock/trending/increment
// @desc    Add 1 to trending score of a stock
// @access  Public
router.post(
  '/trending/increment',
  trending_stocks_controller.incrementTrendingStock
);

// @route   GET stock/trending/top
// @desc    Get top 10 trending stocks
// @access  Public
router.get('/trending/top', trending_stocks_controller.getTopTrendingStocks);

// @route   GET stock/AROONOSC/:code
// @desc    Gets AROON Oscillator indicator for stock with code CODE
// @access  Public
router.get('/AROONOSC/:code', (req, res) => {
  const code = req.params.code;
  console.log('Recieved AROONOSC request for:', code);

  // asynchronous function for getting data
  const retrieveResults = async () => {
    const results = await getAROONOSC(code);
    return results;
  };

  try {
    retrieveResults().then((results) => {
      const analysis = results['Technical Analysis: AROONOSC'];
      const AROON = analysis[Object.keys(analysis)[0]];
      const payload = {
        AROON,
      };

      return res.status(200).json(payload);
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ err });
  }
});
module.exports = router;
