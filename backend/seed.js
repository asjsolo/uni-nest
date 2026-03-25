import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Item from './models/Item.js';
import Review from './models/Review.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Item.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data');

    // Create fake users
    const users = await User.insertMany([
      { name: 'Alice Santos', email: 'alice@university.edu' },
      { name: 'Bob Reyes', email: 'bob@university.edu' },
      { name: 'Charlie Cruz', email: 'charlie@university.edu' },
      { name: 'Diana Lopez', email: 'diana@university.edu' },
      { name: 'Ethan Garcia', email: 'ethan@university.edu' },
    ]);
    console.log(`Created ${users.length} users`);

    // Create fake rental items
    const items = await Item.insertMany([
      {
        name: 'TI-84 Calculator',
        description: 'Texas Instruments graphing calculator, great for math and engineering courses.',
        category: 'Electronics',
        marketPrice: 120,
        rentalPrice: 15,
        owner: users[0]._id,
        image: 'https://placehold.co/300x200/4f46e5/white?text=Calculator',
      },
      {
        name: 'Organic Chemistry Textbook',
        description: '8th edition, covers all chapters. Minor highlights inside.',
        category: 'Books',
        marketPrice: 85,
        rentalPrice: 10,
        owner: users[1]._id,
        image: 'https://placehold.co/300x200/059669/white?text=Textbook',
      },
      {
        name: 'Badminton Racket Set',
        description: 'Set of 2 rackets with shuttlecocks. Perfect for weekend games.',
        category: 'Sports',
        marketPrice: 45,
        rentalPrice: 5,
        owner: users[2]._id,
        image: 'https://placehold.co/300x200/d97706/white?text=Racket',
      },
      {
        name: 'Arduino Starter Kit',
        description: 'Complete kit with Arduino Uno, breadboard, wires, sensors and LEDs.',
        category: 'Electronics',
        marketPrice: 60,
        rentalPrice: 8,
        owner: users[0]._id,
        image: 'https://placehold.co/300x200/dc2626/white?text=Arduino',
      },
      {
        name: 'Lab Coat (Size M)',
        description: 'White lab coat, clean and pressed. Required for chemistry labs.',
        category: 'Clothing',
        marketPrice: 30,
        rentalPrice: 3,
        owner: users[3]._id,
        image: 'https://placehold.co/300x200/7c3aed/white?text=Lab+Coat',
      },
      {
        name: 'Drill Machine',
        description: 'Cordless drill with bits. Useful for engineering projects and dorm fixes.',
        category: 'Tools',
        marketPrice: 90,
        rentalPrice: 12,
        owner: users[4]._id,
        image: 'https://placehold.co/300x200/0891b2/white?text=Drill',
      },
    ]);
    console.log(`Created ${items.length} items`);

    // Create sample reviews (simulated completed rentals)
    const reviews = await Review.insertMany([
      {
        reviewer: users[1]._id,
        item: items[0]._id,
        rentalId: 'RENTAL-001',
        rating: 5,
        comment: 'Calculator was in perfect condition. Alice is very reliable!',
      },
      {
        reviewer: users[2]._id,
        item: items[0]._id,
        rentalId: 'RENTAL-002',
        rating: 4,
        comment: 'Great calculator, worked perfectly for my exams.',
      },
      {
        reviewer: users[3]._id,
        item: items[1]._id,
        rentalId: 'RENTAL-003',
        rating: 4,
        comment: 'Textbook had some highlights but overall good condition.',
      },
      {
        reviewer: users[0]._id,
        item: items[2]._id,
        rentalId: 'RENTAL-004',
        rating: 5,
        comment: 'Rackets were great! Had an awesome weekend game with friends.',
      },
      {
        reviewer: users[4]._id,
        item: items[3]._id,
        rentalId: 'RENTAL-005',
        rating: 3,
        comment: 'Kit was missing one sensor, but overall usable for my project.',
      },
      {
        reviewer: users[1]._id,
        item: items[5]._id,
        rentalId: 'RENTAL-006',
        rating: 5,
        comment: 'Drill was powerful and came fully charged. Ethan was very helpful.',
      },
    ]);
    console.log(`Created ${reviews.length} reviews`);

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedData();
