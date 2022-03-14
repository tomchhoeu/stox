const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const Watchlist = require('../models/watchlistModel');
const WatchlistStock = require('../models/watchlistStockModel');
const general_helpers = require('../helpers/generalControllerHelpers');
const config = require('./config');
const TOKEN_KEY = config.key;

const {
  getDaily,
  getQuoteEndpoint,
  getIntraday,
  getSearchEndpoint,
} = require('../alphaVantageAPI');

exports.getWatchlists = (req, res) => {
  const token = req.params.token;
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];
  User.findById(id, (err, result) => {
    if (err) {
      return res.status(500).json('Error connecting to the database');
    }
    if (result) {
      // const payload = result.watchlists;
      let payload = [];
      for (const watchlist of result.watchlists) {
        let numberOfStocks = 0;
        for (const stock of watchlist.stocks) {
          numberOfStocks += 1;
        }

        const result = {
          name: watchlist.name,
          _id: watchlist._id,
          numStocks: numberOfStocks,
        };
        payload.push(result);
      }
      console.log(payload);
      return res.status(200).json(payload);
    }
    console.log('getWatchlists - 401 error - Bad Token (I think?)');
    return res.status(401).json('Bad token');
  });
};

exports.getWatchlistSpecific = (req, res) => {
  // 'user' is the token of the current user, which is passed in through the backend url.
  const token = req.params.token;
  const watchlistId = req.params.id;
  // The token contains the user id that represents the given user in the MongoDB database.
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];
  // This finds the user by the given id, and returns an array of all their watchlists, which each contain
  // their unique id, their name, and the array of stocks that each watchlist has.
  User.findById(id, (err, result) => {
    if (err) {
      return res.status(500).json('Error connecting to the database');
    }
    if (result) {
      const watchlist = result.watchlists.find(
        (item) => item._id == watchlistId
      );
      console.log(watchlist);
      let payload = {};
      if (watchlist != undefined) {
        payload = {
          stocks: watchlist.stocks,
        };
      }
      return res.status(200).json(payload);
    }
    console.log('getWatchlistSpecific - 401 error - Bad Token (I think?)');
    return res.status(401).json('Bad token');
  });
};

exports.addWatchlist = (req, res) => {
  const { token, watchlistName } = req.body;
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];
  let newWatchlist = new Watchlist();
  newWatchlist.name = watchlistName;
  console.log(`ADD WATCHLIST --- NAME IS : ${watchlistName}`);
  // User.findOne( { _id : id, 'watchlists.name' : watchlistName} , (err, result) => {
  //   if (err) {
  //     return res.status(500).json('Error connecting to the database');
  //   }
  //   if (result) {
  //     console.log(result);
  //     return res.status(403).json('Watchlist already exists!');
  //   }
  //   User.findByIdAndUpdate(id, { $push : { watchlists : newWatchlist } }, (err, result) => {
  //     if (err) {
  //       return res.status(500).json('Error connecting to the database');
  //     }
  //     if (result) {
  //       return res.status(200).json([{id : result._id}]);
  //     }
  //     return res.status(401).json('addWatchlist - 401 Error');
  //   });
  // });
  if (watchlistName == '')
    return res.status(403).json('You must enter a name for the watchlist!');
  User.findById(id, (err, result) => {
    if (err) {
      return res.status(500).json('Error connecting to the database');
    }
    if (result) {
      const watchlist = result.watchlists.find(
        (item) => item.name == watchlistName
      );
      if (watchlist != undefined) {
        console.log(watchlist);
        return res.status(403).json('Watchlist already exists!');
      }
      result.watchlists.push(newWatchlist);
      console.log(newWatchlist);
      console.log(result);
      result.save();
      return res.status(200).json([{ id: newWatchlist._id }]);
    }
    return res.status(401).json('addWatchlist - 401 Error');
  });
};

// Removes a watchlist from a user's list of watcchlists
exports.removeWatchlist = (req, res) => {
  const { token, watchlistId } = req.body;
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];
  User.findByIdAndUpdate(
    id,
    { $pull: { watchlists: { _id: watchlistId } } },
    (err, result) => {
      if (err) {
        return res.status(500).json('Error connecting to the database');
      }
      if (result) {
        return res.status(200).json('Watchlist removed!');
      }
      return res.status(401).json('removeWatchlist - 401 Error');
    }
  );
};

// Adds a stock to a specified watchlist
exports.addStockToWatchlist = (req, res) => {
  const { token, watchlistId } = req.body;
  const stock_code = req.body.stock_code.toUpperCase();
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];

  User.findById(id, async (err, result) => {
    if (err) {
      return res.status(500);
    }
    if (result) {
      // console.log(watchlistId);
      const check = await general_helpers.checkIfStock(stock_code);
      if (check == false) {
        return res
          .status(403)
          .json(`${stock_code} is not a symbol of a recognised equity!`);
      }
      let watchlist = result.watchlists.find((item) => item._id == watchlistId);
      // Check to ensure that the watchlist represented by the id passed actually exists.
      if (watchlist == undefined) {
        return res.status(403).json('This watchlist does not exist!');
      }
      // Check to see if the given stock code isn't already in the given watchlist.
      if (
        watchlist.stocks.find((item) => item.equitySymbol == stock_code) !=
        undefined
      ) {
        return res
          .status(403)
          .json('Stock already exists inside this Watchlist!');
      }

      // Adding the stock to the watchlist.
      watchlist.stocks.push(new WatchlistStock({ equitySymbol: stock_code }));

      // Saving the changes made to the database.
      result.save();

      return res.status(200).json('Stock added to watchlist!');
    }
    return res.status(403);
  });
};

// Removes a stock to a specified watchlist
exports.removeStockFromWatchlist = (req, res) => {
  const { token, watchlistId, stock_code } = req.body;
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];

  User.findById(id, (err, result) => {
    if (err) {
      return res.status(500);
    }
    if (result) {
      let watchlist = result.watchlists.find((item) => item._id == watchlistId);
      if (watchlist == undefined) {
        return res.status(403).json('This watchlist does not exist!');
      }
      // Check to see if the given stock code isn't in the given watchlist.
      const index = watchlist.stocks.findIndex(
        (item) => item.equitySymbol == stock_code
      );
      // -1 == not found
      if (index == -1) {
        return res
          .status(403)
          .json(
            `Watchlist does not contain the given stock ${stock_code}, and wasn't removed!`
          );
      }
      // Removes the element at the given index and decrements the length of the array by 1.
      watchlist.stocks.splice(index, 1);
      watchlist.markModified('stocks');
      result.save();
      return res.status(200).json('Stock was removed from the watchlist!');
    }

    return res
      .status(403)
      .json('removeStockFromWatchlist - 403 error - Something went wrong!');
  });
};
