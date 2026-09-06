const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMissingPersons,
  createMissingPerson,
  updateMissingPersonStatus,
  deleteMissingPerson,
} = require('../controllers/missingPersonController');

router.get('/', getMissingPersons);
router.post('/', protect, createMissingPerson);
router.put('/:id', protect, updateMissingPersonStatus);
router.delete('/:id', protect, deleteMissingPerson);

module.exports = router;
