const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const ReliefCamp = require('./models/ReliefCamp');

dotenv.config();

const seedMoreCamps = async () => {
  try {
    await connectDB();
    console.log('Seeding more camps...');

    const ngo = await User.findOne({ email: 'ngo@gmail.com' });
    if (!ngo) {
      console.log('No NGO found! Run seedAll.js first.');
      process.exit(1);
    }

    const newCamps = [
      {
        name: 'Mumbai Central Relief Hub',
        managedBy: ngo._id,
        description: 'Coastal flood relief center.',
        location: { type: 'Point', coordinates: [72.8777, 19.0760] },
        address: 'Bandra West, Mumbai',
        district: 'Mumbai',
        state: 'Maharashtra',
        capacity: 500,
        currentOccupancy: 200,
        status: 'active',
        facilities: ['medical', 'food', 'water', 'shelter'],
        disasterTypes: ['flood', 'cyclone'],
        acceptingRefugees: true,
      },
      {
        name: 'Delhi Emergency Command Center',
        managedBy: ngo._id,
        description: 'Central coordination for northern region.',
        location: { type: 'Point', coordinates: [77.1025, 28.7041] },
        address: 'Connaught Place, New Delhi',
        district: 'New Delhi',
        state: 'Delhi',
        capacity: 1000,
        currentOccupancy: 400,
        status: 'active',
        facilities: ['medical', 'food', 'water', 'shelter', 'communication'],
        disasterTypes: ['earthquake', 'heatwave'],
        acceptingRefugees: true,
      },
      {
        name: 'Kolkata Cyclone Shelter',
        managedBy: ngo._id,
        description: 'Safe haven for cyclone victims.',
        location: { type: 'Point', coordinates: [88.3639, 22.5726] },
        address: 'Salt Lake City, Kolkata',
        district: 'Kolkata',
        state: 'West Bengal',
        capacity: 300,
        currentOccupancy: 150,
        status: 'active',
        facilities: ['medical', 'food', 'water', 'shelter'],
        disasterTypes: ['cyclone', 'flood'],
        acceptingRefugees: true,
      },
      {
        name: 'Karnataka Relief Center',
        managedBy: ngo._id,
        description: 'Drought and flood relief camp.',
        location: { type: 'Point', coordinates: [75.7139, 15.3173] },
        address: 'Hubli, Karnataka',
        district: 'Dharwad',
        state: 'Karnataka',
        capacity: 400,
        currentOccupancy: 100,
        status: 'active',
        facilities: ['medical', 'food', 'water', 'shelter'],
        disasterTypes: ['flood'],
        acceptingRefugees: true,
      }
    ];

    for (const campData of newCamps) {
      let camp = await ReliefCamp.findOne({ name: campData.name });
      if (!camp) {
        await ReliefCamp.create(campData);
        console.log(`Created: ${campData.name}`);
      } else {
        console.log(`Already exists: ${campData.name}`);
      }
    }

    console.log('Done seeding additional camps!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedMoreCamps();
