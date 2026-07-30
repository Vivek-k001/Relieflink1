const express = require('express');
const router = express.Router();
const { getLocalNews, getInternationalNews, getTicker } = require('../controllers/newsController');

router.get('/local', getLocalNews);
router.get('/international', getInternationalNews);
router.get('/ticker', getTicker);

module.exports = router;
