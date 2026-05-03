const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');
};

const canteens = ['PSIT 2004', 'Nescafe', 'Amul', 'Samocha', 'Urban Vada Pao', 'Che-Canteen', 'Nescafe-CHE'];

const menuData = {
  'Nescafe': [
    { name: 'Masala Chai', price: 15, category: 'Drinks', prepTime: 5, isVeg: true, description: 'Freshly brewed spiced tea', image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400' },
    { name: 'Cold Coffee', price: 50, category: 'Drinks', prepTime: 5, isVeg: true, description: 'Creamy cold coffee', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
    { name: 'Cappuccino', price: 70, category: 'Drinks', prepTime: 8, isVeg: true, description: 'Rich espresso with foam', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400' },
    { name: 'Veg Sandwich', price: 45, category: 'Snacks', prepTime: 10, isVeg: true, description: 'Fresh grilled sandwich', image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400' },
    { name: 'Maggi', price: 40, category: 'Snacks', prepTime: 8, isVeg: true, description: 'Hot spicy noodles', image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400' },
  ],
  'Amul': [
    { name: 'Cheese Butter Toast', price: 35, category: 'Breakfast', prepTime: 8, isVeg: true, description: 'Toasted bread with Amul butter & cheese', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400' },
    { name: 'Amul Lassi', price: 30, category: 'Drinks', prepTime: 3, isVeg: true, description: 'Sweet yogurt drink', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400' },
    { name: 'Ice Cream Sandwich', price: 40, category: 'Desserts', prepTime: 2, isVeg: true, description: 'Classic Amul ice cream', image: 'https://images.unsplash.com/photo-1631700564882-7e08bb77b0c3?w=400' },
    { name: 'Butter Milk', price: 20, category: 'Drinks', prepTime: 2, isVeg: true, description: 'Chilled spiced buttermilk', image: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400' },
  ],
  'Urban Vada Pao': [
    { name: 'Classic Vada Pao', price: 25, category: 'Fast Food', prepTime: 8, isVeg: true, description: 'Mumbai-style vada pav with chutney', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400' },
    { name: 'Schezwan Vada Pao', price: 35, category: 'Fast Food', prepTime: 10, isVeg: true, description: 'Spicy schezwan twist on the classic', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
    { name: 'Masala Fries', price: 55, category: 'Snacks', prepTime: 12, isVeg: true, description: 'Crispy fries with Indian spices', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400' },
    { name: 'Pao Bhaji', price: 65, category: 'Meals', prepTime: 15, isVeg: true, description: 'Buttery pav bhaji with toasted pav', image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400' },
  ],
  'Samocha': [
    { name: 'Samosa (2 pcs)', price: 20, category: 'Snacks', prepTime: 5, isVeg: true, description: 'Crispy samosas with tamarind chutney', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
    { name: 'Chole Bhature', price: 80, category: 'Meals', prepTime: 15, isVeg: true, description: 'Spicy chole with fluffy bhature', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400' },
    { name: 'Aloo Tikki Chaat', price: 50, category: 'Snacks', prepTime: 10, isVeg: true, description: 'Spicy potato patties with chaat masala', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400' },
    { name: 'Dal Makhani + Rice', price: 90, category: 'Meals', prepTime: 20, isVeg: true, description: 'Creamy dal with steamed rice', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
  ],
  'PSIT 2004': [
    { name: 'Thali (Full)', price: 120, category: 'Meals', prepTime: 20, isVeg: true, description: '5-dish complete meal', image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400' },
    { name: 'Rajma Chawal', price: 80, category: 'Meals', prepTime: 15, isVeg: true, description: 'Kidney beans curry with rice', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400' },
    { name: 'Poha', price: 30, category: 'Breakfast', prepTime: 8, isVeg: true, description: 'Light flattened rice breakfast', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
    { name: 'Idli Sambar (3 pcs)', price: 50, category: 'Breakfast', prepTime: 10, isVeg: true, description: 'Soft idlis with coconut chutney', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400' },
  ],
  'Che-Canteen': [
    { name: 'Pasta Arrabbiata', price: 110, category: 'Meals', prepTime: 20, isVeg: true, description: 'Spicy tomato pasta', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400' },
    { name: 'Paneer Wrap', price: 90, category: 'Fast Food', prepTime: 12, isVeg: true, description: 'Grilled paneer in a wrap', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400' },
    { name: 'Healthy Salad Bowl', price: 95, category: 'Healthy', prepTime: 8, isVeg: true, description: 'Fresh veggies with lemon dressing', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
    { name: 'Fresh Lime Soda', price: 40, category: 'Drinks', prepTime: 3, isVeg: true, description: 'Sweet or salted lime soda', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400' },
  ],
  'Nescafe-CHE': [
    { name: 'Espresso', price: 60, category: 'Drinks', prepTime: 5, isVeg: true, description: 'Strong single espresso shot', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400' },
    { name: 'Latte', price: 90, category: 'Drinks', prepTime: 8, isVeg: true, description: 'Smooth milk-forward coffee', image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400' },
    { name: 'Club Sandwich', price: 110, category: 'Snacks', prepTime: 15, isVeg: false, description: 'Triple-decker loaded sandwich', image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400' },
    { name: 'Brownie', price: 70, category: 'Desserts', prepTime: 2, isVeg: true, description: 'Warm chocolate fudge brownie', image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400' },
  ]
};

const seedDB = async () => {
  await connectDB();

  // Create owner accounts
  console.log('Creating owner accounts...');
  for (const canteen of canteens) {
    const email = `owner.${canteen.toLowerCase().replace(/\s+/g, '').replace(/-/g, '')}@orderup.psit`;
    const exists = await User.findOne({ email });
    if (!exists) {
      await User.create({ name: `${canteen} Owner`, email, password: 'password123', role: 'owner', canteen });
      console.log(`  ✅ Owner for ${canteen}: ${email} / password123`);
    }
  }

  // Create admin
  const adminEmail = 'admin@orderup.psit';
  const adminExists = await User.findOne({ email: adminEmail });
  if (!adminExists) {
    await User.create({ name: 'System Admin', email: adminEmail, password: 'admin123', role: 'admin' });
    console.log(`  ✅ Admin: ${adminEmail} / admin123`);
  }

  // Create test student
  const studentEmail = 'student@psit.ac.in';
  const studentExists = await User.findOne({ email: studentEmail });
  if (!studentExists) {
    await User.create({ name: 'Test Student', email: studentEmail, password: 'student123', role: 'student' });
    console.log(`  ✅ Student: ${studentEmail} / student123`);
  }

  // Seed menu items
  console.log('\nSeeding menu items...');
  for (const [canteen, items] of Object.entries(menuData)) {
    for (const item of items) {
      const exists = await MenuItem.findOne({ name: item.name, canteen });
      if (!exists) {
        await MenuItem.create({ ...item, canteen });
        console.log(`  ✅ [${canteen}] ${item.name}`);
      }
    }
  }

  console.log('\n🎉 Database seeded successfully!');
  process.exit(0);
};

seedDB().catch(err => { console.error(err); process.exit(1); });
