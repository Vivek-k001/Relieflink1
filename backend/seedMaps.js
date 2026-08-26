const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const ReliefCamp = require('./models/ReliefCamp');
const SosRequest = require('./models/SosRequest');

dotenv.config();

const seedMapData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Create a dummy NGO user to own the camps
    let ngoUser = await User.findOne({ role: 'ngo', email: 'demo_ngo@relieflink.com' });
    if (!ngoUser) {
      ngoUser = await User.create({
        name: 'Global Relief Foundation',
        email: 'demo_ngo@relieflink.com',
        phone: '9876543211',
        password: 'password123', // Doesn't matter, just for seeding
        role: 'ngo',
        isVerified: true
      });
      console.log('Created dummy NGO user');
    }

    // Coordinates around New Delhi for a realistic cluster, or the default map coordinates (20.5937, 78.9629)
    // The map default is userLat or 20.5937, 78.9629 (Central India). 
    // Let's use coordinates around there so it shows up on the default zoom.
    const baseLat = 20.5937;
    const baseLng = 78.9629;

    // Clear existing dummy data (optional, let's just add new ones)
    // await ReliefCamp.deleteMany({ managedBy: ngoUser._id });

    // Create 3 realistic Relief Camps
    const camps = [
      {
        name: 'Central Relief Hub - Alpha',
        managedBy: ngoUser._id,
        description: 'Main distribution center for food and water.',
        location: { type: 'Point', coordinates: [baseLng + 0.05, baseLat + 0.05] }, // [lng, lat]
        address: 'Downtown Relief Center',
        district: 'Central',
        state: 'Maharashtra',
        capacity: 500,
        currentOccupancy: 342,
        status: 'active',
        facilities: ['food', 'water', 'medical', 'shelter'],
        contactPhone: '1800-111-222',
      },
      {
        name: 'Emergency Medical Camp - Beta',
        managedBy: ngoUser._id,
        description: 'Equipped with emergency medical supplies and doctors.',
        location: { type: 'Point', coordinates: [baseLng - 0.03, baseLat - 0.02] },
        address: 'Westside Community Hall',
        district: 'West',
        state: 'Maharashtra',
        capacity: 200,
        currentOccupancy: 198,
        status: 'full',
        facilities: ['medical', 'shelter'],
        contactPhone: '1800-111-333',
      },
      {
        name: 'Safe Haven Shelter',
        managedBy: ngoUser._id,
        description: 'Temporary housing for displaced families.',
        location: { type: 'Point', coordinates: [baseLng + 0.02, baseLat - 0.06] },
        address: 'Eastside School Grounds',
        district: 'East',
        state: 'Maharashtra',
        capacity: 1000,
        currentOccupancy: 450,
        status: 'active',
        facilities: ['shelter', 'food'],
        contactPhone: '1800-111-444',
      }
    ];

    await ReliefCamp.insertMany(camps);
    console.log('Inserted 3 Relief Camps');

    // Create a dummy Affected user
    let affectedUser = await User.findOne({ role: 'affected', email: 'demo_victim@relieflink.com' });
    if (!affectedUser) {
      affectedUser = await User.create({
        name: 'John Doe',
        email: 'demo_victim@relieflink.com',
        phone: '9876543212',
        password: 'password123',
        role: 'affected',
        isVerified: true
      });
      console.log('Created dummy Affected user');
    }

    // Create 5 realistic SOS Requests (red pulsing markers)
    const sosRequests = [
      {
        userId: affectedUser._id,
        userName: 'John Doe',
        userPhone: '9876543212',
        location: { type: 'Point', coordinates: [baseLng + 0.01, baseLat + 0.02] },
        address: 'Sector 4, Main Road',
        priority: 'high',
        disasterType: 'flood',
        description: 'Trapped on the roof due to rising water levels.',
        status: 'pending',
        numberOfPeople: 4,
        medicalEmergency: false,
      },
      {
        userId: affectedUser._id,
        userName: 'John Doe',
        userPhone: '9876543212',
        location: { type: 'Point', coordinates: [baseLng - 0.04, baseLat + 0.03] },
        address: 'Apartment Complex B',
        priority: 'critical',
        disasterType: 'earthquake',
        description: 'Elderly person needs immediate oxygen support.',
        status: 'pending',
        numberOfPeople: 1,
        medicalEmergency: true,
      },
      {
        userId: affectedUser._id,
        userName: 'John Doe',
        userPhone: '9876543212',
        location: { type: 'Point', coordinates: [baseLng + 0.06, baseLat - 0.01] },
        address: 'Highway 7 Toll Plaza',
        priority: 'medium',
        disasterType: 'flood',
        description: 'Stranded without food and water for 24 hours.',
        status: 'assigned',
        numberOfPeople: 12,
        medicalEmergency: false,
      },
      {
        userId: affectedUser._id,
        userName: 'John Doe',
        userPhone: '9876543212',
        location: { type: 'Point', coordinates: [baseLng - 0.01, baseLat - 0.04] },
        address: 'Village Outskirts',
        priority: 'high',
        disasterType: 'flood',
        description: 'Bridge collapsed, need evacuation via boat.',
        status: 'pending',
        numberOfPeople: 8,
        medicalEmergency: false,
      },
      {
        userId: affectedUser._id,
        userName: 'John Doe',
        userPhone: '9876543212',
        location: { type: 'Point', coordinates: [baseLng + 0.03, baseLat + 0.06] },
        address: 'North Hills',
        priority: 'critical',
        disasterType: 'landslide',
        description: 'Severe injuries from landslide, need medics.',
        status: 'pending',
        numberOfPeople: 2,
        medicalEmergency: true,
      }
    ];

    await SosRequest.insertMany(sosRequests);
    console.log('Inserted 5 SOS Requests');

    console.log('Map Data Seeding Complete! The maps will now look alive.');
    process.exit();
  } catch (error) {
    console.error('Error seeding map data:', error);
    process.exit(1);
  }
};

seedMapData();
