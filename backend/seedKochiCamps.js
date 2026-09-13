require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ReliefCamp = require('./models/ReliefCamp');

async function seedKochiCamps() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    let ngoUser = await User.findOne({ role: 'ngo' });
    if (!ngoUser) {
      ngoUser = await User.findOne();
    }

    const kochiCamps = [
      {
        name: 'Kochi Town Hall Relief Center',
        managedBy: ngoUser._id,
        description: 'Central urban relief shelter with primary medical clinic, drinking water, and cooked meals.',
        location: { type: 'Point', coordinates: [76.2819, 9.9816] }, // [lng, lat]
        address: 'Ernakulam Town Hall, Banerji Rd, Kacheripady, Kochi',
        district: 'Ernakulam',
        state: 'Kerala',
        capacity: 450,
        currentOccupancy: 180,
        status: 'active',
        facilities: ['food', 'water', 'medical', 'shelter', 'sanitation'],
        contactPhone: '+91 484 2351234',
        contactEmail: 'ernakulam.relief@kerala.gov.in',
        disasterTypes: ['flood', 'rain', 'urban waterlogging'],
        acceptingRefugees: true,
      },
      {
        name: 'Marine Drive Community Shelter',
        managedBy: ngoUser._id,
        description: 'Coastal evacuation facility equipped with emergency power generators and disaster bedding.',
        location: { type: 'Point', coordinates: [76.2760, 9.9790] },
        address: 'GCDA Complex, Marine Drive, Kochi',
        district: 'Ernakulam',
        state: 'Kerala',
        capacity: 300,
        currentOccupancy: 95,
        status: 'active',
        facilities: ['shelter', 'food', 'water'],
        contactPhone: '+91 484 2398765',
        contactEmail: 'marinedrive.camp@relieflink.org',
        disasterTypes: ['flood', 'cyclone'],
        acceptingRefugees: true,
      },
      {
        name: 'Kakkanad Civil Station Relief Hub',
        managedBy: ngoUser._id,
        description: 'District administration primary supply depot and 24/7 medical response center.',
        location: { type: 'Point', coordinates: [76.3419, 10.0159] },
        address: 'Collectorate Ground, Kakkanad, Ernakulam',
        district: 'Ernakulam',
        state: 'Kerala',
        capacity: 600,
        currentOccupancy: 210,
        status: 'active',
        facilities: ['medical', 'food', 'water', 'shelter'],
        contactPhone: '+91 484 2422288',
        contactEmail: 'kakkanad.hub@kerala.gov.in',
        disasterTypes: ['flood', 'landslide'],
        acceptingRefugees: true,
      },
      {
        name: 'Aluva Flood Evacuation Center',
        managedBy: ngoUser._id,
        description: 'Periyar river flood relief center with speed rescue boats and pediatric care.',
        location: { type: 'Point', coordinates: [76.3516, 10.1076] },
        address: 'Government High School Ground, Aluva, Ernakulam',
        district: 'Ernakulam',
        state: 'Kerala',
        capacity: 500,
        currentOccupancy: 310,
        status: 'active',
        facilities: ['food', 'water', 'medical', 'shelter'],
        contactPhone: '+91 484 2623344',
        contactEmail: 'aluva.floodcamp@kerala.gov.in',
        disasterTypes: ['flood'],
        acceptingRefugees: true,
      },
      {
        name: 'Alappuzha Coastal Flood Shelter',
        managedBy: ngoUser._id,
        description: 'Kuttanad & coastal zone relief base with emergency medical aid and water purification.',
        location: { type: 'Point', coordinates: [76.3388, 9.4981] },
        address: 'SDV School Grounds, Alappuzha Beach Road',
        district: 'Alappuzha',
        state: 'Kerala',
        capacity: 400,
        currentOccupancy: 150,
        status: 'active',
        facilities: ['food', 'water', 'medical', 'shelter'],
        contactPhone: '+91 477 2251122',
        contactEmail: 'alappuzha.shelter@kerala.gov.in',
        disasterTypes: ['flood', 'sea erosion'],
        acceptingRefugees: true,
      }
    ];

    for (const camp of kochiCamps) {
      const exists = await ReliefCamp.findOne({ name: camp.name });
      if (!exists) {
        await ReliefCamp.create(camp);
        console.log(`Added: ${camp.name}`);
      } else {
        console.log(`Already exists: ${camp.name}`);
      }
    }

    console.log('Seeding finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
}

seedKochiCamps();
