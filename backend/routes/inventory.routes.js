const express = require('express');
const router = express.Router();
const { addItem, getCampInventory, updateItem, deleteItem, dispenseItem } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Volunteers can view inventory, but only NGO/admin can modify
router.get('/:campId', getCampInventory);

router.post('/', authorize('ngo', 'admin'), addItem);
router.put('/:id', authorize('ngo', 'admin'), updateItem);
router.put('/:id/dispense', authorize('ngo', 'admin'), dispenseItem);
router.delete('/:id', authorize('ngo', 'admin'), deleteItem);

module.exports = router;
