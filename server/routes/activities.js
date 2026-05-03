const express = require('express');
const activityController = require('../controller/activityController');

const router = express.Router();

router.get('/', activityController.getAllActivities);
router.get('/:id', activityController.getActivityById);
router.post('/', activityController.createActivity);
router.put('/:id', activityController.updateActivity);
router.delete('/:id', activityController.deleteActivity);
router.patch('/:id/activate', activityController.activateActivity);
router.patch('/:id/deactivate', activityController.deactivateActivity);

module.exports = router;
