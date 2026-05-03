const express = require('express');
const logController = require('../controller/logController');

const router = express.Router();

router.get('/', logController.getAllLogs);
router.get('/action/:action', logController.getLogsByAction);
router.get('/user/:userId', logController.getLogsByUser);

module.exports = router;
