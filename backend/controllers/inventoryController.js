const Inventory = require('../models/Inventory');

// @desc  Add inventory item
// @route POST /api/inventory
const addItem = async (req, res) => {
  try {
    const { campId, itemName, category, quantity, unit, minStockLevel, expiryDate, donor, notes } = req.body;
    const item = await Inventory.create({
      campId, ngoId: req.user._id, itemName, category,
      quantity, unit, minStockLevel: minStockLevel || 10,
      expiryDate, donor, notes,
    });
    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get inventory for a camp
// @route GET /api/inventory/:campId
const getCampInventory = async (req, res) => {
  try {
    const { campId } = req.params;
    const items = await Inventory.find({ campId }).sort({ category: 1, itemName: 1 });
    const lowStock = items.filter((i) => i.quantity <= i.minStockLevel);
    res.json({ success: true, items, lowStockCount: lowStock.length, lowStock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update inventory quantity
// @route PUT /api/inventory/:id
const updateItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete inventory item
// @route DELETE /api/inventory/:id
const deleteItem = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item removed from inventory' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Dispense items (reduce quantity when fulfilling request)
// @route PUT /api/inventory/:id/dispense
const dispenseItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.quantity < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }
    item.quantity -= quantity;
    item.lastUpdated = new Date();
    await item.save();
    res.json({ success: true, item, message: `${quantity} ${item.unit} dispensed` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addItem, getCampInventory, updateItem, deleteItem, dispenseItem };
