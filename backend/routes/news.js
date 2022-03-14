const express = require('express');
const {
  getTopHeadlines,
  getEverything,
  getSentiments,
} = require('../newsAPI.js');

const { getCompanyOverview } = require('../alphaVantageAPI.js');

const router = express.Router();

// @route   GET news/:stock
// @desc    Gets news about a specific stock
// @access  Public
// @return  array of news article objects
router.get('/:stock', (req, res) => {
  const stock_code = req.params.stock;
  console.log(`GET news/:code called with ${stock_code}`);

  const retrieveResults = async (q) => {
    let news = {};
    if (q == '') {
      news = await getTopHeadlines();
    } else {
      news = await getEverything((searchTerm = q), (sortBy = 'relevancy'));
    }
    const payload = {
      news,
    };
    return res.status(200).json(payload);
  };

  try {
    getQuery(stock_code).then((q) => {
      retrieveResults(q);
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ err });
  }
});

/**
 * Function that generates a query for searching for news
 *
 * @param {object|string} stock_code the stocks to get news for (object), or 'NO_CODE' for general news
 * @return string - the relevant query
 */

const getQuery = async function (stock_code) {
  if (typeof stock_code === 'string') {
    if (stock_code === 'NO_CODE') {
      const q = '';
      return q;
    } else {
      const overview = await getCompanyOverview(stock_code);
      const q = overview.Symbol + ' OR "' + overview.Name + '"';
      return q;
    }
  } else {
    as_calls = async function () {
      let queries = [];

      for (const s in stock_code) {
        const overview = await getCompanyOverview(stock_code[s]);
        const q = overview.Symbol + ' OR "' + overview.Name + '"';
        console.log('q is', q);
        queries.push(q);
      }
      return queries;
    };
    const data = as_calls().then((x) => {
      return x.join(' OR ');
    });
    return data;
  }
};

// @route   GET news/summary/:stock_code
// @desc    Gets summary about sentiment for a stock
// @access  Public
// @return  sentiment

router.get('/summary/:stock_code', async (req, res) => {
  const stock_code = req.params.stock_code;

  try {
    sent = await getSentiments(stock_code);
    payload = {
      sent,
    };
    return res.status(200).json(payload);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ err });
  }
});

// @route   POST news/multistock
// @desc    Gets news for multiple stocks at once
// @access  Public
// @return  news
router.post('/multistock', async (req, res) => {
  const stocks = req.body;
  console.log('stocks are:', stocks);
  if (Object.entries(stocks).length === 0) {
    console.log('Empty stocks, using normal news');

    try {
      news = await getTopHeadlines();
      const payload = {
        news,
      };
      return res.status(200).json(payload);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ err });
    }
  } else {
    const q = await getQuery(stocks);
    console.log('q is', q);
    try {
      news = await getEverything(q, (sortBy = 'relevancy'));
      const payload = {
        news,
      };
      return res.status(200).json(payload);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ err });
    }
  }
});

module.exports = router;
