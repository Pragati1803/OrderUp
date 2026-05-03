const MenuItem = require('../models/MenuItem');

// GET /api/menu?canteen=Nescafe&category=Drinks
exports.getMenu = async (req, res) => {
  try {
    const { canteen, category, search } = req.query;

    const filter = {};

    if (canteen) {
      const formattedCanteen = canteen.replace(/\+/g, " ");
      filter.canteen = formattedCanteen;
    }

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    // ✅ MOVE LOG HERE
    console.log("FINAL FILTER:", filter);

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });

    console.log("ITEMS FOUND:", items);

    res.json({ items });

  } catch (err) {
    console.error("MENU ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/menu
exports.createItem = async (req, res) => {
  try {
    const item = await MenuItem.create({ ...req.body, canteen: req.user.canteen });
    res.status(201).json({ item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/menu/:id
exports.updateItem = async (req, res) => {
  try {
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, canteen: req.user.canteen },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/menu/:id
exports.deleteItem = async (req, res) => {
  try {
    const item = await MenuItem.findOneAndDelete({ _id: req.params.id, canteen: req.user.canteen });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/menu/:id/toggle
exports.toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findOne({ _id: req.params.id, canteen: req.user.canteen });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
