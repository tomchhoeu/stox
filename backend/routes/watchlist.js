const express = require('express');
// const user_controller = require('../controllers/userController');
const watchlist_controller = require('../controllers/watchlistController');

const router = express.Router();
const verify = require('../controllers/verify');

// @route   GET watchlist/:token
// @desc    Gets all of a user's watchlists
// @access  Private
// @return  Array of user watchlist objects (with details included)
router.get('/:token', verify, (req, res) => {
  const token = req.params.token;
  console.log(`watchlist/:token route called with token:\n${token}`);
  // return user_controller.getWatchlists(req, res);
  return watchlist_controller.getWatchlists(req, res);
  //res.send('Watchlist user route');
});

// @route   GET watchlist/:token/:id
// @desc    Gets a user's watchlist with id
// @access  Private
// @return  Watchlist object (name, stocks inside)
router.get('/:token/:id', verify, (req, res) => {
  const token = req.params.token;
  const watchlistId = req.params.id;
  console.log(`GET watchlist/user/id called with:\n${token},\n${watchlistId}`);
  // return user_controller.getWatchlistSpecific(req, res);
  return watchlist_controller.getWatchlistSpecific(req, res);
  //res.send('GET watchlist/user/id route');
});

// @route   POST watchlist
// @desc    Creates a new watchlist for a user
// @access  Private
// @return  watchlistId
router.post('/', verify, (req, res) => {
  const { token, watchlistName } = req.body; // destructuring the request body
  console.log(`POST watchlist called with:\n${token},\n${watchlistName}`);
  // return user_controller.addWatchlist(req, res);
  return watchlist_controller.addWatchlist(req, res);
  //res.send('POST watchlist route');
});

// @route   DELETE watchlist
// @desc    Delete's a user's watchlist
// @access  Private
router.delete('/', verify, (req, res) => {
  const { token, watchlistId } = req.body; // destructuring the request body
  console.log(`DELETE watchlist called with:\n${token},\n${watchlistId}`);
  // return user_controller.removeWatchlist(req, res);
  return watchlist_controller.removeWatchlist(req, res);
  //res.send('DELETE watchlist route');
});

// @route   POST watchlist/add_stock
// @desc    Adds a stock to a watchlist
// @access  Private
router.post('/add_stock', verify, (req, res) => {
  const { token, watchlistId, stock_code } = req.body; // destructuring the request body
  console.log(
    `POST watchlist/add_stock called with:\n${token},\n${watchlistId},\n${stock_code}`
  );
  // return user_controller.addStockToWatchlist(req, res);
  return watchlist_controller.addStockToWatchlist(req, res);
  //res.send('POST watchlist/add_stock route');
});

// @route   POST watchlist/remove_stock
// @desc    Revmoves a stock from a watchlist
// @access  Private
router.post('/remove_stock', verify, (req, res) => {
  const { token, watchlistId, stock_code } = req.body; // destructuring the request body
  console.log(
    `POST watchlist/remove_stock called with:\n${token},\n${watchlistId},\n${stock_code}`
  );
  // return user_controller.removeStockFromWatchlist(req, res);
  return watchlist_controller.removeStockFromWatchlist(req, res);
  //res.send('POST watchlist/remove_stock route');
});

module.exports = router;
