const express = require('express');
const studentController = require('../controller/studentController');

const router = express.Router();

router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', studentController.createStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);
router.post('/:id/photo', studentController.uploadPhoto);

module.exports = router;
