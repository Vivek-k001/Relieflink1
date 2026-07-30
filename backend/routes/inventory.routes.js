const express = require('express');
const router = express.Router();
const { addItem, getCampInventory, updateItem, deleteItem, dispenseItem } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('ngo', 'admin'));
router.post('/', addItem);
router.get('/:campId', getCampInventory);
router.put('/:id', updateItem);
router.put('/:id/dispense', dispenseItem);
router.delete('/:id', deleteItem);

module.exports = router;
