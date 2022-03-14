const express = require('express');
const router = express.Router();
const user_controller = require('../controllers/userController');

const token = require('../controllers/token');

router.post('/user', user_controller.getPortfolios);
router.post('/', user_controller.addPortfolio);

module.exports = router;
