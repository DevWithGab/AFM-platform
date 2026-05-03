const express = require('express');
const attendanceController = require('../controller/attendanceController');

const router = express.Router();

router.post('/', attendanceController.recordAttendance);
router.get('/', attendanceController.getAllAttendance);
router.get('/activity/:activityId', attendanceController.getAttendanceByActivity);
router.get('/student/:studentId', attendanceController.getAttendanceByStudent);
router.put('/:id', attendanceController.updateAttendance);
router.delete('/:id', attendanceController.deleteAttendance);

module.exports = router;
