const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

router.post('/message', protect, async (req, res) => {
  try {
    const { message, canteen, conversationHistory = [] } = req.body;

    // Fetch context
    const [activeOrders, menuItems] = await Promise.all([
      Order.find({ user: req.user._id, status: { $in: ['pending', 'accepted', 'preparing', 'ready'] } }).lean(),
      canteen ? MenuItem.find({ canteen, isAvailable: true }).lean() : []
    ]);

    const menuContext = menuItems.map(m =>
      `${m.name} (${m.category}) - ₹${m.price}, prep: ${m.prepTime}min, ${m.isVeg ? 'Veg' : 'Non-Veg'}`
    ).join('\n');

    const orderContext = activeOrders.map(o =>
      `Token ${o.tokenNumber}: ${o.status}, ETA: ${o.estimatedTime}min, Canteen: ${o.canteen}`
    ).join('\n');

    const systemPrompt = `You are OrderBot, the friendly AI assistant for OrderUp — a smart canteen ordering platform at PSIT college.

Available canteens: PSIT 2004, Nescafe, Amul, Samocha, Urban Vada Pao, Che-Canteen, Nescafe-CHE.

${menuContext ? `Current menu at ${canteen}:\n${menuContext}` : ''}
${orderContext ? `\nUser's active orders:\n${orderContext}` : ''}

User name: ${req.user.name}

Capabilities:
- Help choose food based on mood/budget/preference
- Track order status
- Answer FAQs about tokens, ordering, payment
- Suggest meals

Keep responses short, friendly, use emojis. If asked about specific order status, use the order data provided.`;

    const messages = [
      ...conversationHistory.slice(-8),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: systemPrompt,
        messages
      })
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Sorry, I couldn't process that. Please try again!";

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
