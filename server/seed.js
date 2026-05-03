const mongoose = require('mongoose');
const User = require('./model/User');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Clear existing users
    await User.deleteMany({});

    // Create adviser user
    const adviser = new User({
      name: 'Adviser Account',
      email: 'adviser@school.com',
      password: 'password123',
      role: 'adviser',
    });
    await adviser.save();
    console.log('Adviser created: adviser@school.com / password123');

    // Create officer user
    const officer = new User({
      name: 'Officer Account',
      email: 'officer@school.com',
      password: 'password123',
      role: 'officer',
    });
    await officer.save();
    console.log('Officer created: officer@school.com / password123');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
