const express = require('express');
const reportController = require('../controller/reportController');

const router = express.Router();

router.post('/generate', reportController.generateReport);

module.exports = router;
