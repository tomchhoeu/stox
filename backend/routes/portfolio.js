const express = require('express');
//const user_controller = require('../controllers/userController');
const portfolio_controller = require('../controllers/portfolioController');

const router = express.Router();
const verify = require('../controllers/verify');

// @route   GET portfolio/summary/:token
// @desc    Gets a user's performance across all portfolios
// @access  Private
// @return  change, per_change
router.get('/summary/:token', verify, (req, res) => {
  const token = req.params.token;
  console.log(`GET portfolio/summary/:token called with:\n${token}`);
  // return user_controller.getSummary(req, res);
  return portfolio_controller.getSummary(req, res);
});

// @route   GET portfolio/:token
// @desc    Gets all of a user's portfolios
// @access  Private
// @return  Array of user portfolio objects (with details included)
router.get('/:token', verify, (req, res) => {
  const token = req.params.token;
  console.log(`GET portfolio/:token route called with :\n${token}`);
  // return user_controller.getPortfolios(req, res);
  return portfolio_controller.getPortfolios(req, res);
});

// @route   GET portfolio/:token/:id
// @desc    Gets a user's portfolio with id
// @access  Private
// @return  Portfolio object (name, stocks inside)
router.get('/:token/:id', verify, (req, res) => {
  const token = req.params.token;
  const portfolio_id = req.params.id;
  console.log(`GET portfolio/user/id called with:\n${token},\n${portfolio_id}`);
  // return user_controller.getPortfolioSpecific(req, res);
  return portfolio_controller.getPortfolioSpecific(req, res);
  //res.send('GET portfolio/user/id route');
});

// @route   POST portfolio
// @desc    Creates a new portfolio for a user
// @access  Private
// @return  portfolio_id
router.post('/', verify, (req, res) => {
  const { token, name } = req.body; // destructuring the request body
  console.log(`POST portfolio called with ${token}, ${name}`);
  //res.send('POST portfolio route');

  // return user_controller.addPortfolio(req, res);
  return portfolio_controller.addPortfolio(req, res);
});

// @route   DELETE portfolio
// @desc    Delete's a user's portfolio
// @access  Private
router.delete('/', verify, (req, res) => {
  const { token, portfolio_id } = req.body; // destructuring the request body
  //res.send('DELETE portfolio route');
  console.log(`DELETE portfolio called with:\n${token},\n${portfolio_id}`);
  // return user_controller.removePortfolio(req, res);
  return portfolio_controller.removePortfolio(req, res);
});

// @route   POST portfolio/add_stock
// @desc    Adds an AMOUNT of a stock to a portfolio
// @access  Private
router.post('/add_stock', verify, (req, res) => {
  const { token, portfolio_id, stock_code, amount, price } = req.body; // destructuring the request body
  console.log(
    `POST portfolio/add_stock called with:\n${token},\n${portfolio_id},\n${stock_code},\n${amount}`
  );
  // return user_controller.addStockToPortfolio(req, res);
  return portfolio_controller.addStockToPortfolio(req, res);
  //res.send('POST portfolio/add_stock route');
});

// @route   POST portfolio/remove_stock
// @desc    Removes a stock from a portfolio
// @access  Private
router.post('/remove_stock', verify, (req, res) => {
  // NOTE: should we allow remove_stock and add_stock to modify existing stocks in a portfolio matching
  //       the name given by the amount that is given? Or should all modification-type stuff be handled
  //       by another separate function?
  //  e.g. if DAB has amount 24, and we call add_stock(DAB, 90), will it add 90 to the DAB element, or
  //       throw an error? Similarly for remove_stock.
  const { token, portfolio_id, stock_code } = req.body; // destructuring the request body
  console.log(
    `POST portfolio/remove_stock called with:\n${token},\n${portfolio_id},\n${stock_code}`
  );
  // return user_controller.removeStockFromPortfolio(req, res);
  return portfolio_controller.removeStockFromPortfolio(req, res);
  //res.send('POST portfolio/remove_stock route');
});

// @route   GET portfolio/:token/:id
// @desc    Gets a user's portfolio with id
// @access  Private
// @return  List of equity symbols stocks inside portfolio
router.get('/stocks/:token/:id', (req, res) => {
  const token = req.params.token;
  const portfolio_id = req.params.id;
  console.log(
    `GET portfolio/stocks/user/id called with:\n${token},\n${portfolio_id}`
  );
  // return user_controller.getPortfolioStocks(req, res);
  return portfolio_controller.getPortfolioStocks(req, res);
});

module.exports = router;
