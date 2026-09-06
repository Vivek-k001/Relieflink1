const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const User = require('./models/User');
const ReliefCamp = require('./models/ReliefCamp');
const Inventory = require('./models/Inventory');
const SosRequest = require('./models/SosRequest');
const DisasterAlert = require('./models/DisasterAlert');

dotenv.config();

const seedAll = async () => {
  try {
    await connectDB();
    console.log('🌱 Seeding database with ReliefLink demo data...');

    // 1. Seed Super Admin
    let admin = await User.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      admin = new User({
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password: 'admin@123',
        role: 'admin',
        isVerified: true,
        isActive: true,
      });
      await admin.save();
    } else {
      admin.password = 'admin@123';
      await admin.save();
    }

    // 2. Seed NGO User
    let ngo = await User.findOne({ email: 'ngo@gmail.com' });
    if (!ngo) {
      ngo = new User({
        name: 'ReliefLink NGO Admin',
        email: 'ngo@gmail.com',
        password: 'ngo@123',
        role: 'ngo',
        organizationName: 'ReliefLink Care Foundation',
        registrationNumber: 'NGO-2026-88',
        isVerified: true,
        isActive: true,
        location: { coordinates: [76.13, 11.68] },
        address: 'Kalpetta, Wayanad',
        district: 'Wayanad',
        state: 'Kerala',
      });
      await ngo.save();
    } else {
      ngo.password = 'ngo@123';
      await ngo.save();
    }

    // 3. Seed Volunteer User
    let volunteer = await User.findOne({ email: 'volunteer@gmail.com' });
    if (!volunteer) {
      volunteer = new User({
        name: 'Rahul Kumar (Volunteer)',
        email: 'volunteer@gmail.com',
        password: 'volunteer@123',
        phone: '9123456789',
        role: 'volunteer',
        isVerified: true,
        isActive: true,
        skills: ['Medical First Aid', 'Search & Rescue', 'Logistics Driving'],
        vehicleType: '4x4 Rescue Truck',
        isAvailable: true,
        location: { coordinates: [76.14, 11.69] },
        address: 'Meppadi, Wayanad',
        district: 'Wayanad',
        state: 'Kerala',
      });
      await volunteer.save();
    } else {
      volunteer.password = 'volunteer@123';
      await volunteer.save();
    }

    // 4. Seed Affected Person
    let affected = await User.findOne({ phone: '9876543210' });
    if (!affected) {
      affected = new User({
        name: 'Anu Varghese',
        phone: '9876543210',
        role: 'affected',
        isVerified: true,
        isActive: true,
        isSafe: false,
        location: { coordinates: [76.12, 11.67] },
        address: 'Chooralmala, Meppadi',
        district: 'Wayanad',
        state: 'Kerala',
      });
      await affected.save();
    }

    // 5. Seed Relief Camp
    let camp = await ReliefCamp.findOne({ name: 'Wayanad Central Emergency Camp' });
    if (!camp) {
      camp = await ReliefCamp.create({
        name: 'Wayanad Central Emergency Camp',
        managedBy: ngo._id,
        description: 'Primary emergency shelter equipped with medical bay, kitchen, and sleeping quarters.',
        location: { type: 'Point', coordinates: [76.13, 11.68] },
        address: 'St. Joseph School Ground, Kalpetta',
        district: 'Wayanad',
        state: 'Kerala',
        capacity: 250,
        currentOccupancy: 84,
        status: 'active',
        facilities: ['medical', 'food', 'water', 'shelter', 'sanitation'],
        contactPhone: '04936-202020',
        contactEmail: 'camp@relieflink.org',
        disasterTypes: ['landslide', 'flood'],
        acceptingRefugees: true,
      });
    }

    // 6. Seed Inventory
    const existingInv = await Inventory.find({ campId: camp._id });
    if (existingInv.length === 0) {
      await Inventory.insertMany([
        { campId: camp._id, ngoId: ngo._id, itemName: 'Drinking Water Bottles (2L)', category: 'water', quantity: 500, unit: 'bottles', minStockLevel: 100 },
        { campId: camp._id, ngoId: ngo._id, itemName: 'Rice & Grains', category: 'food', quantity: 1200, unit: 'kg', minStockLevel: 200 },
        { campId: camp._id, ngoId: ngo._id, itemName: 'Emergency First Aid Kits', category: 'medicine', quantity: 60, unit: 'kits', minStockLevel: 20 },
        { campId: camp._id, ngoId: ngo._id, itemName: 'Blankets & Tarpaulins', category: 'blanket', quantity: 180, unit: 'pieces', minStockLevel: 50 },
      ]);
    }

    // 7. Seed SOS Requests
    const sosCount = await SosRequest.countDocuments();
    if (sosCount === 0) {
      await SosRequest.create({
        userId: affected._id,
        userName: affected.name,
        userPhone: affected.phone,
        disasterType: 'landslide',
        description: 'Water level rising rapidly near Chooralmala bridge. 4 family members trapped on 1st floor.',
        priority: 'critical',
        status: 'pending',
        location: { type: 'Point', coordinates: [76.12, 11.67] },
        address: 'House 42, Chooralmala Road',
        numberOfPeople: 4,
        medicalEmergency: true,
      });
    }

    // 8. Seed Disaster Alert
    const alertCount = await DisasterAlert.countDocuments();
    if (alertCount === 0) {
      await DisasterAlert.create({
        title: '🔴 Red Alert: Heavy Rainfall & Landslide Warning',
        severity: 'critical',
        disasterType: 'landslide',
        affectedArea: 'Meppadi & Chooralmala Region, Wayanad',
        description: 'IMD has issued a Red Alert for Wayanad district due to torrential rains. Residents in hilly terrain are advised to move to higher ground or nearest relief camps immediately.',
        instructions: ['Do not cross overflowing streams.', 'Contact emergency SOS if isolated.', 'Evacuate to St. Joseph Emergency Camp if ordered.'],
        issuedBy: ngo._id,
        issuedByName: 'ReliefLink NGO Admin',
        isActive: true,
      });
    }

    console.log('✅ ReliefLink Database Seeding Completed Successfully!');
    console.log(`
  ═════════════════════════════════════════════════════
   Credentials for Demo Accounts:
   - 🛡️ Admin:     admin@gmail.com     / admin@123
   - 🏢 NGO:       ngo@gmail.com       / ngo@123
   - ⛑️ Volunteer: volunteer@gmail.com / volunteer@123
   - 📱 Affected:  Phone: 9876543210   / OTP: 123456
  ═════════════════════════════════════════════════════
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedAll();
