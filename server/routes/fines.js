const express = require('express');
const fineController = require('../controller/fineController');

const router = express.Router();

router.get('/', fineController.getAllFines);
router.get('/student/:studentId', fineController.getFinesByStudent);
router.get('/:id', fineController.getFineById);
router.post('/', fineController.createFine);
router.put('/:id', fineController.updateFine);
router.delete('/:id', fineController.deleteFine);
router.patch('/:id/mark-paid', fineController.markAsPaid);

module.exports = router;
