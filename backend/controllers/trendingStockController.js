const jwt = require('jsonwebtoken');
const nodemon = require('nodemon');

// import model
const TrendingStock = require('../models/trendingStockModel');

// Create a new trending stock, if it doesn't exist already
exports.createTrendingStock = (req, res) => {
  // TODO: test by just console logging request body
  console.log('creating trending stock: ', req.body);

  const { equitySymbol } = req.body;
  // check if trending stock already created
  TrendingStock.findOne({ equitySymbol: equitySymbol }, (err, result) => {
    if (err) {
      return res.status(500).send('Database error looking for trending stock!');
    }
    if (result) {
      console.log('Trending stock already exists!');
      return res.status(400).send('Trending stock already exists!');
    } else {
      // save new trending stock
      let trendingStock = new TrendingStock({
        equitySymbol: equitySymbol,
        trendingScore: 1,
      });
      trendingStock.save();
      return res.status(200).send('Stock saved!');
    }
  });
};

// Find a trending stock by equity symbol
exports.findTrendingStock = (equitySymbol) => {
  TrendingStock.findOne({ equitySymbol: equitySymbol }, (err, result) => {
    if (err) {
      return res.status(500).send('Database error looking for trending stock!');
    }
    if (result) {
      console.log('Found trending stock with equity symbol: ', equitySymbol);
      return result;
    } else {
      console.log(
        'Could not find trending stock with equity symbol: ',
        equitySymbol
      );
      return null;
    }
  });
};

// Adds 1 to trending score of a stock
exports.incrementTrendingStock = (req, res) => {
  const { equitySymbol } = req.body;

  // If trending stock doesn't exist, create it
  TrendingStock.findOne({ equitySymbol: equitySymbol }, (err, result) => {
    if (!result) {
      let trendingStock = new TrendingStock({
        equitySymbol: equitySymbol,
        trendingScore: 1,
      });
      trendingStock.save();
      return res
        .status(200)
        .send(`Trending stock ${equitySymbol} incremented!`);
    } else {
      // Else, just increment
      TrendingStock.findOneAndUpdate(
        { equitySymbol: equitySymbol },
        { $inc: { trendingScore: 1 } },
        (err, result) => {
          if (err) {
            return res
              .status(500)
              .send('Database error looking for trending stock!');
          }
          if (result) {
            return res
              .status(200)
              .send(`Trending stock ${equitySymbol} incremented!`);
          }
          return res.status(401).send('Error incrementing trending stock!');
        }
      );
    }
  });
};

// Get top 10 trending stocks
exports.getTopTrendingStocks = (req, res) => {
  TrendingStock.find()
    .sort({ trendingScore: -1 })
    .limit(10)
    .exec((err, result) => {
      if (err) {
        return res
          .status(500)
          .send('Database error looking for trending stock!');
      }
      if (result) {
        let stocksResult = [];
        for (let stock of result) {
          stocksResult.push(stock['equitySymbol']);
        }
        console.log(stocksResult);

        return res.status(200).send({ stocks: stocksResult });
      }
      return res.status(401).send('Error finding trending stocks!');
    });
};
