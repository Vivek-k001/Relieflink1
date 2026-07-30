const express = require('express');
const router = express.Router();
const { getWeather, getForecast, getIpLocation } = require('../controllers/weatherController');

router.get('/', getWeather);
router.get('/forecast', getForecast);
router.get('/ip-location', getIpLocation);

module.exports = router;
