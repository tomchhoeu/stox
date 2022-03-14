const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const Portfolio = require('../models/portfolioModel');
const PortfolioStock = require('../models/portfolioStockModel');
const portfolio_helpers = require('../helpers/portfolioControllerHelpers');
const general_helpers = require('../helpers/generalControllerHelpers');
const config = require('./config');
const TOKEN_KEY = config.key;

const {
  getDaily,
  getQuoteEndpoint,
  getIntraday,
  getSearchEndpoint,
} = require('../alphaVantageAPI');

/**
 * @param {JSON} req This is the fetch request that contains the parameter 'user', which is the token
 * of the current user.
 */
exports.getPortfolios = (req, res) => {
  // 'user' is the token of the current user, which is passed in through the backend url.
  const token = req.params.token;
  // The token contains the user id that represents the given user in the MongoDB database.
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];
  // This finds the user by the given id, and returns an array of all their portfolios, which each contain
  // their unique id, their name, and the array of stocks that each portfolio has.
  User.findById(id, async (err, result) => {
    if (err) {
      return res.status(500).json('Error connecting to the database');
    }
    if (result) {
      // console.log(token);
      // console.log(result.portfolios);
      // console.log(result.portfolios[0])
      const payload = [];
      for (const portfolio of result.portfolios) {
        const summary = await portfolio_helpers.getSummaryHelper(portfolio);
        // console.log(summary);
        const result = {
          _id: portfolio._id,
          name: portfolio.name,
          value: summary.dailyLastSum.toFixed(2),
          dolChange: summary.dailyChange.toFixed(2),
          perChange: parseFloat(summary.dailyChangePercentage).toFixed(2),
          totalDolChange: summary.totalChange.toFixed(2),
          totalPerChange: parseFloat(summary.totalChangePercentage).toFixed(2),
        };
        payload.push(result);
        // console.log(payload)
      }
      // const summary = getSummaryHelper();
      // result.portfolio.summary = summary;
      // const payload = result.portfolios;

      return res.status(200).json(payload);
    }
    console.log('getPortfolios - 401 error - Bad Token');
    return res.status(401).json('Bad token');
  });
};

exports.getPortfolioSpecific = (req, res) => {
  // 'user' is the token of the current user, which is passed in through the backend url.
  const token = req.params.token;
  const portfolio_id = req.params.id;
  // The token contains the user id that represents the given user in the MongoDB database.
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];
  // This finds the user by the given id, and returns an array of all their portfolios, which each contain
  // their unique id, their name, and the array of stocks that each portfolio has.
  User.findById(id, (err, result) => {
    if (err) {
      return res.status(500).json('Error connecting to the database');
    }
    if (result) {
      let payload = result.portfolios.find((item) => item._id == portfolio_id);
      // console.log(payload);
      if (payload == undefined) {
        payload = {};
      }
      return res.status(200).json(payload);
    }
    console.log('getPortfolioSpecific - 401 error - Bad Token (I think?)');
    return res.status(401).json('Bad token');
  });
};

exports.addPortfolio = (req, res) => {
  const { token, portfolio_name } = req.body;
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];
  let newPortfolio = new Portfolio();
  newPortfolio.name = portfolio_name;
  if (portfolio_name == '')
    return res.status(403).json('You must enter a name for the portfolio!');
  User.findOne(
    { _id: id, 'portfolios.name': portfolio_name },
    (err, result) => {
      if (err) {
        return res.status(500).json('Error connecting to the database');
      }
      if (result) {
        return res.status(403).json('Portfolio already exists!');
      }
      User.findByIdAndUpdate(
        id,
        { $push: { portfolios: newPortfolio } },
        (err, result) => {
          if (err) {
            return res.status(500).json('Error connecting to the database');
          }
          if (result) {
            console.log(`ID of new portfolio is:\n${newPortfolio._id}`);
            return res.status(200).json(JSON.stringify(newPortfolio._id));
          }
          return res.status(401).json('addPortfolio - 401 Error');
        }
      );
    }
  );
};

// Removes a portfolio from a user's list of portfolios
exports.removePortfolio = (req, res) => {
  const { token, portfolio_id } = req.body;
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];
  User.findByIdAndUpdate(
    id,
    { $pull: { portfolios: { _id: portfolio_id } } },
    (err, result) => {
      if (err) {
        return res.status(500).json('Error connecting to the database');
      }
      if (result) {
        return res.status(200).json('Portfolio removed!');
      }
      return res.status(401).json('removePortfolio - 401 Error');
    }
  );
};

// Adds a stock to a specified portfolio
exports.addStockToPortfolio = (req, res) => {
  const { token, portfolio_id, amount, price } = req.body;
  const stock_code = req.body.stock_code.toUpperCase();
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];
  if (stock_code == '')
    return res.status(403).json('You must enter an equity symbol!');
  if (amount == 0 || price == 0)
    return res.status(403).json('Amount and Price must be greater than zero!');
  User.findById(id, async (err, result) => {
    if (err) {
      return res.status(500).json('Error connecting to the database');
    }
    if (result) {
      const check = await general_helpers.checkIfStock(stock_code);
      //console.log(`result for stock code check ${check}`);
      if (check == false) {
        //console.log(`${stock_code} is not a symbol of a recognised equity!`);
        return res
          .status(403)
          .json(`${stock_code} is not a symbol of a recognised equity!`);
      }

      //const stock = await getSearchEndpoint(stock_code);
      let portfolio = result.portfolios.find(
        (item) => item._id == portfolio_id
      );
      // Check to ensure that the portfolio represented by the id passed actually exists.
      if (portfolio == undefined) {
        return res.status(403).json('This portfolio does not exist!');
      }
      // Check to see if the given stock code isn't already in the given portfolio.
      if (
        portfolio.stocks.find((item) => item.equitySymbol == stock_code) !=
        undefined
      ) {
        return res
          .status(403)
          .json('Stock already exists inside this Portfolio!');
      }

      // console.log("aaa", stock);
      // console.log(stock["bestMatches"])
      // if (stock["bestMatches"] == null) {
      //   return res.status(403).json('Stock not found!');
      // }
      // if (stock["bestMatches"].length == 0) {
      //   return res.status(403).json('Stock not found!');
      // }
      // else if (stock['bestMatches'][0]['1. symbol'] !== stock_code) {
      //   return res.status(403).json('Stock not found!');
      // }

      // a
      // Adding the stock to the portfolio.
      portfolio.stocks.push(
        new PortfolioStock({
          equitySymbol: stock_code,
          amount: amount,
          buyPrice: price,
        })
      );

      // Saving the changes made to the database.
      result.save();

      return res.status(200).json('Added stock successfully');
    }
    return res.status(403);
  });
};

// Removes a stock to a specified portfolio
exports.removeStockFromPortfolio = (req, res) => {
  const { token, portfolio_id, stock_code } = req.body;
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];

  User.findById(id, (err, result) => {
    if (err) {
      return res.status(500).json('Error connecting to the database');
    }
    if (result) {
      let portfolio = result.portfolios.find(
        (item) => item._id == portfolio_id
      );
      if (portfolio == undefined) {
        return res.status(403).json('This portfolio does not exist!');
      }
      // Check to see if the given stock code isn't in the given portfolio.
      const index = portfolio.stocks.findIndex(
        (item) => item.equitySymbol == stock_code
      );
      // -1 == not found
      if (index == -1) {
        return res
          .status(403)
          .json(
            `Portfolio does not contain the given stock ${stock_code}, and wasn't removed!`
          );
      }
      // Removes the element at the given index and decrements the length of the array by 1.
      portfolio.stocks.splice(index, 1);
      portfolio.markModified('stocks');
      result.save();
      return res
        .status(200)
        .json(`${stock_code} was removed from ${portfolio.name} successfully.`);
    }

    return res
      .status(401)
      .send('removeStockFromPortfolio - 401 error - Something went wrong!');
  });
};

/**
 * Gets a performance summary for a specific portfolio based off of a given portfolio ID
 * @returns JavaScript Object - "JSON" data.
 * The data that will be used is:
 * dailyChange,
 * dailyChangePercentage,
 * totalChange, and
 * totalChangePercentage
 *
 * There are two other intermediate variables to ensure modularity, so they can be safely ignored.
 */
exports.getPortfolioSpecificSummary = (req, res) => {
  const token = req.params.token;
  const portfolio_id = req.params.portfolio_id;
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];

  User.findById(id, (err, result) => {
    if (err) {
      return res.status(500).json('Error connecting to the database');
    }
    if (result) {
      // Check portfolio id exists
      const portfolio = result.portfolios.find(
        (item) => item._id == portfolio_id
      );
      if (portfolio == undefined) {
        return res.status(403).json('This portfolio does not exist!');
      }

      // if the helper breaks, copy it's code and replace LITERALLY JUST THIS COMMENT with it.

      const payload = portfolio_helpers.getSummaryHelper(portfolio);
      return res.status(200).json(payload);
    }
    return res
      .status(401)
      .json('getPortfolioSpecificSummary - 401 error - Something went wrong!');
  });
};

/**
 * Gets the overall summary of all a users portfolios.
 */
exports.getSummary = (req, res) => {
  const token = req.params.token;
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];

  User.findById(id, async (err, result) => {
    if (err) {
      return res.status(500).json('Error finding user');
    }
    if (result) {
      try {
        let totalChange = 0.0;
        //let totalChangePercentage = 0.0;
        let dailyChange = 0.0;
        //let dailyChangePercentage = 0.0;
        let dailyLastSum = 0.0;
        let portfolioBuySum = 0.0;

        for (const portfolio of result.portfolios) {
          const data = await portfolio_helpers.getSummaryHelper(portfolio);
          console.log('getAsyncData');
          console.log(data);
          dailyChange += parseFloat(data['dailyChange']);
          dailyLastSum += parseFloat(data['dailyLastSum']);
          totalChange += parseFloat(data['totalChange']);
          portfolioBuySum += parseFloat(data['portfolioBuySum']);
        }

        const totalChangePercentage = portfolioBuySum
          ? ((totalChange / portfolioBuySum) * 100).toFixed(2)
          : 0;
        const dailyChangePercentage = dailyLastSum
          ? ((dailyChange / dailyLastSum) * 100).toFixed(2)
          : 0;

        const payload = {
          dailyLastSum, // This represents current total worth
          dailyChange, // Today's overall change
          dailyChangePercentage,
          totalChange, // Overall change since purchasing all stocks
          totalChangePercentage,
        };
        console.log('getSummary Payload is as follows:');
        console.log(payload);
        return res.status(200).json(payload);
      } catch (err) {
        console.log(err);
      }
    }
    return res
      .status(401)
      .json('getSummary - 401 error - Something went wrong!');
  });
};

// Modifies the variables of a given stock in a given portfolio.
exports.modifyPortfolioStock = (req, res) => {
  const { token, portfolio_id, stock_code, modify_amount } = req.body;
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];

  User.findById(id, (err, result) => {
    if (err) {
      return res.status(500).json('Error connecting to the database');
    }
    if (result) {
      let portfolio = result.portfolios.find(
        (item) => item._id == portfolio_id
      );

      if (portfolio == undefined) {
        return res.status(403).json('This portfolio does not exist!');
      }
      let stock = portfolio.stocks.find(
        (item) => item.equitySymbol == stock_code
      );

      if (stock != undefined) {
        stock.amount += modify_amount;
        // If the stock amount was reduced to a value below zero, return an error message without saving.
        if (stock.amount < 0) {
          return res
            .status(403)
            .json('Stocks to remove exceeds the number stored!');
        }
        // If the stock amount was reduced to 0, remove it from the array.
        else if (stock.amount == 0) {
          // No checks to see if the stock exists is required, as the parent if scope already handles this.
          const index = portfolio.stocks.findIndex(
            (item) => item.equitySymbol == stock_code
          );
          portfolio.stocks.splice(index, 1);
        }
        // Marked as modified to ensure changes to the stocks array persist.
        portfolio.markModified('stocks');
        result.save();
        return res.status(200).json('Stock was successfully modified.');
      }

      return res
        .status(403)
        .json(`Portfolio does not contain the given stock ${stock_code}.`);
    }
  });
};

exports.getPortfolioStocks = (req, res) => {
  // 'user' is the token of the current user, which is passed in through the backend url.
  const token = req.params.token;
  const portfolio_id = req.params.id;
  // The token contains the user id that represents the given user in the MongoDB database.
  const id = jwt.verify(token, TOKEN_KEY)['user_id'];
  // This finds the user by the given id, and returns an array of all their portfolios, which each contain
  // their unique id, their name, and the array of stocks that each portfolio has.
  User.findById(id, (err, result) => {
    if (err) {
      return res.status(500).json('Error connecting to the database');
    }
    if (result) {
      let portfolio = result.portfolios.find(
        (item) => item._id == portfolio_id
      );

      let stocks = [];

      for (const stock of portfolio.stocks) {
        stocks.push(stock.equitySymbol);
      }
      const payload = { stocks };
      return res.status(200).json(payload);
    }
    console.log('getPortfolioSpecific - 401 error - Bad Token (I think?)');
    return res.status(401).json('Bad token');
  });
};
