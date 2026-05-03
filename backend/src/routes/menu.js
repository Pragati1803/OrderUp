const express = require('express');
const router = express.Router();
const { getMenu, createItem, updateItem, deleteItem, toggleAvailability } = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getMenu);
router.post('/', protect, authorize('owner', 'admin'), createItem);
router.put('/:id', protect, authorize('owner', 'admin'), updateItem);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteItem);
router.patch('/:id/toggle', protect, authorize('owner', 'admin'), toggleAvailability);

module.exports = router;

router.get('/add-test', async (req, res) => {
  const MenuItem = require('../models/MenuItem');

  const item = await MenuItem.create({
    name: "Burger",
    price: 50,
    category: "Snacks",
    canteen: "PSIT 2004"
  });

  res.json(item);
});