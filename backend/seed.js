import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Item from './models/Item.js';
import Review from './models/Review.js';
import Rental from './models/Rental.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Item.deleteMany({});
    await Review.deleteMany({});
    await Rental.deleteMany({});
    console.log('Cleared existing data');

    // ===== USERS =====
    const users = await User.insertMany([
      { name: 'Alice Santos', email: 'alice@university.edu' },
      { name: 'Bob Reyes', email: 'bob@university.edu' },
      { name: 'Charlie Cruz', email: 'charlie@university.edu' },
      { name: 'Diana Lopez', email: 'diana@university.edu' },
      { name: 'Ethan Garcia', email: 'ethan@university.edu' },
    ]);
    console.log(`Created ${users.length} users`);

    const [alice, bob, charlie, diana, ethan] = users;

    // ===== ITEMS =====
    const items = await Item.insertMany([
      {
        name: 'TI-84 Calculator',
        description: 'Texas Instruments graphing calculator, great for math and engineering courses.',
        category: 'Electronics',
        marketPrice: 120,
        rentalPrice: 15,
        owner: alice._id,
        image: 'https://placehold.co/300x200/4f46e5/white?text=Calculator',
      },
      {
        name: 'Organic Chemistry Textbook',
        description: '8th edition, covers all chapters. Minor highlights inside.',
        category: 'Books',
        marketPrice: 85,
        rentalPrice: 10,
        owner: bob._id,
        image: 'https://placehold.co/300x200/059669/white?text=Textbook',
      },
      {
        name: 'Badminton Racket Set',
        description: 'Set of 2 rackets with shuttlecocks. Perfect for weekend games.',
        category: 'Sports',
        marketPrice: 45,
        rentalPrice: 5,
        owner: charlie._id,
        image: 'https://placehold.co/300x200/d97706/white?text=Racket',
      },
      {
        name: 'Arduino Starter Kit',
        description: 'Complete kit with Arduino Uno, breadboard, wires, sensors and LEDs.',
        category: 'Electronics',
        marketPrice: 60,
        rentalPrice: 8,
        owner: alice._id,
        image: 'https://placehold.co/300x200/dc2626/white?text=Arduino',
      },
      {
        name: 'Lab Coat (Size M)',
        description: 'White lab coat, clean and pressed. Required for chemistry labs.',
        category: 'Clothing',
        marketPrice: 30,
        rentalPrice: 3,
        owner: diana._id,
        image: 'https://placehold.co/300x200/7c3aed/white?text=Lab+Coat',
      },
      {
        name: 'Drill Machine',
        description: 'Cordless drill with bits. Useful for engineering projects and dorm fixes.',
        category: 'Tools',
        marketPrice: 90,
        rentalPrice: 12,
        owner: ethan._id,
        image: 'https://placehold.co/300x200/0891b2/white?text=Drill',
      },
    ]);
    console.log(`Created ${items.length} items`);

    const [calculator, textbook, racket, arduino, labcoat, drill] = items;

    // ===== RENTALS (Dummy completed + ongoing) =====
    const rentals = await Rental.insertMany([
      // --- Completed rentals ---
      {
        rentalId: 'RENTAL-001',
        item: calculator._id,
        itemName: 'TI-84 Calculator',
        lender: alice._id,
        borrower: bob._id,
        rentalPrice: 15,
        marketPrice: 120,
        durationDays: 7,
        totalCost: 105,        // 15 * 7
        status: 'completed',
        startDate: new Date('2026-01-10'),
        endDate: new Date('2026-01-17'),
      },
      {
        rentalId: 'RENTAL-002',
        item: calculator._id,
        itemName: 'TI-84 Calculator',
        lender: alice._id,
        borrower: charlie._id,
        rentalPrice: 15,
        marketPrice: 120,
        durationDays: 3,
        totalCost: 45,         // 15 * 3
        status: 'completed',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-02-04'),
      },
      {
        rentalId: 'RENTAL-003',
        item: textbook._id,
        itemName: 'Organic Chemistry Textbook',
        lender: bob._id,
        borrower: diana._id,
        rentalPrice: 10,
        marketPrice: 85,
        durationDays: 14,
        totalCost: 140,        // 10 * 14
        status: 'completed',
        startDate: new Date('2026-01-20'),
        endDate: new Date('2026-02-03'),
      },
      {
        rentalId: 'RENTAL-004',
        item: racket._id,
        itemName: 'Badminton Racket Set',
        lender: charlie._id,
        borrower: alice._id,
        rentalPrice: 5,
        marketPrice: 45,
        durationDays: 2,
        totalCost: 10,         // 5 * 2
        status: 'completed',
        startDate: new Date('2026-02-15'),
        endDate: new Date('2026-02-17'),
      },
      {
        rentalId: 'RENTAL-005',
        item: arduino._id,
        itemName: 'Arduino Starter Kit',
        lender: alice._id,
        borrower: ethan._id,
        rentalPrice: 8,
        marketPrice: 60,
        durationDays: 10,
        totalCost: 80,         // 8 * 10
        status: 'completed',
        startDate: new Date('2026-02-05'),
        endDate: new Date('2026-02-15'),
      },
      {
        rentalId: 'RENTAL-006',
        item: drill._id,
        itemName: 'Drill Machine',
        lender: ethan._id,
        borrower: bob._id,
        rentalPrice: 12,
        marketPrice: 90,
        durationDays: 5,
        totalCost: 60,         // 12 * 5
        status: 'completed',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-06'),
      },
      {
        rentalId: 'RENTAL-007',
        item: labcoat._id,
        itemName: 'Lab Coat (Size M)',
        lender: diana._id,
        borrower: charlie._id,
        rentalPrice: 3,
        marketPrice: 30,
        durationDays: 30,
        totalCost: 90,         // 3 * 30
        status: 'completed',
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-02-14'),
      },
      {
        rentalId: 'RENTAL-008',
        item: textbook._id,
        itemName: 'Organic Chemistry Textbook',
        lender: bob._id,
        borrower: alice._id,
        rentalPrice: 10,
        marketPrice: 85,
        durationDays: 7,
        totalCost: 70,         // 10 * 7
        status: 'completed',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-08'),
      },
      // --- Ongoing rentals ---
      {
        rentalId: 'RENTAL-009',
        item: calculator._id,
        itemName: 'TI-84 Calculator',
        lender: alice._id,
        borrower: diana._id,
        rentalPrice: 15,
        marketPrice: 120,
        durationDays: 5,
        totalCost: 75,         // 15 * 5
        status: 'ongoing',
        startDate: new Date('2026-03-22'),
      },
      {
        rentalId: 'RENTAL-010',
        item: drill._id,
        itemName: 'Drill Machine',
        lender: ethan._id,
        borrower: charlie._id,
        rentalPrice: 12,
        marketPrice: 90,
        durationDays: 3,
        totalCost: 36,         // 12 * 3
        status: 'ongoing',
        startDate: new Date('2026-03-24'),
      },
      {
        rentalId: 'RENTAL-011',
        item: arduino._id,
        itemName: 'Arduino Starter Kit',
        lender: alice._id,
        borrower: bob._id,
        rentalPrice: 8,
        marketPrice: 60,
        durationDays: 14,
        totalCost: 112,        // 8 * 14
        status: 'ongoing',
        startDate: new Date('2026-03-20'),
      },
    ]);
    console.log(`Created ${rentals.length} rentals`);

    // ===== REVIEWS =====
    const reviews = await Review.insertMany([
      {
        reviewer: bob._id,
        item: calculator._id,
        rentalId: 'RENTAL-001',
        rating: 5,
        comment: 'Calculator was in perfect condition. Alice is very reliable!',
      },
      {
        reviewer: charlie._id,
        item: calculator._id,
        rentalId: 'RENTAL-002',
        rating: 4,
        comment: 'Great calculator, worked perfectly for my exams.',
      },
      {
        reviewer: diana._id,
        item: textbook._id,
        rentalId: 'RENTAL-003',
        rating: 4,
        comment: 'Textbook had some highlights but overall good condition.',
      },
      {
        reviewer: alice._id,
        item: racket._id,
        rentalId: 'RENTAL-004',
        rating: 5,
        comment: 'Rackets were great! Had an awesome weekend game with friends.',
      },
      {
        reviewer: ethan._id,
        item: arduino._id,
        rentalId: 'RENTAL-005',
        rating: 3,
        comment: 'Kit was missing one sensor, but overall usable for my project.',
      },
      {
        reviewer: bob._id,
        item: drill._id,
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
