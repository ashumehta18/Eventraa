const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('./models/Event');
const { MongoMemoryServer } = require('mongodb-memory-server');

const sampleEvents = [
  {
    title: "Tech Conference 2025",
    description: "Join us for an exciting tech conference featuring the latest innovations in AI and cloud computing.",
    category: "Conference",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60",
    date: new Date('2025-02-15'),
    location: {
      venue: "Tech Hub Auditorium",
      address: "789 Electronic City",
      city: "Bangalore",
      country: "India"
    },
    tickets: [
      { type: "Early Bird", price: 1999, available: 100 },
      { type: "Regular", price: 2999, available: 200 }
    ],
    price: 1999,
    createdBy: "system"
  },
  {
    title: "Music Festival 2025",
    description: "Experience amazing live music from international and local artists.",
    category: "Music",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=60",
    date: new Date('2025-03-20'),
    location: {
      venue: "Open Air Park",
      address: "Marathahalli",
      city: "Bangalore",
      country: "India"
    },
    tickets: [
      { type: "VIP", price: 4999, available: 50 },
      { type: "General", price: 2499, available: 500 }
    ],
    price: 2499,
    createdBy: "system"
  },
  {
    title: "Web Development Workshop",
    description: "Learn modern web development with React, Node.js, and MongoDB.",
    category: "Workshop",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
    date: new Date('2025-01-25'),
    location: {
      venue: "Grand Convention Center",
      address: "MG Road",
      city: "Bangalore",
      country: "India"
    },
    tickets: [
      { type: "Student", price: 999, available: 30 },
      { type: "Professional", price: 1999, available: 70 }
    ],
    price: 999,
    createdBy: "system"
  },
  {
    title: "Startup Networking Event",
    description: "Connect with entrepreneurs, investors, and industry leaders.",
    category: "Networking",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60",
    date: new Date('2025-02-01'),
    location: {
      venue: "Royal Banquet Hall",
      address: "Koramangala",
      city: "Bangalore",
      country: "India"
    },
    tickets: [
      { type: "Founder", price: 2999, available: 100 },
      { type: "Investor", price: 4999, available: 50 }
    ],
    price: 2999,
    createdBy: "system"
  },
  {
    title: "Yoga & Wellness Retreat",
    description: "A rejuvenating weekend of yoga, meditation, and wellness activities.",
    category: "Wellness",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=60",
    date: new Date('2025-03-08'),
    location: {
      venue: "Lakeside Resort",
      address: "Devanahalli",
      city: "Bangalore",
      country: "India"
    },
    tickets: [
      { type: "Weekend Pass", price: 3999, available: 100 },
      { type: "Full Week", price: 7999, available: 50 }
    ],
    price: 3999,
    createdBy: "system"
  },
  {
    title: "Art Exhibition Opening",
    description: "Contemporary art exhibition featuring works from emerging artists.",
    category: "Art",
    image: "https://images.unsplash.com/photo-1561214115-6d2f1b0609fa?w=800&auto=format&fit=crop&q=60",
    date: new Date('2025-02-10'),
    location: {
      venue: "Art Gallery Downtown",
      address: "Brigade Road",
      city: "Bangalore",
      country: "India"
    },
    tickets: [
      { type: "General Admission", price: 499, available: 300 },
      { type: "VIP Tour", price: 1499, available: 50 }
    ],
    price: 499,
    createdBy: "system"
  }
];

async function seedEvents() {
  try {
    let mongoUri;
    
    if (process.env.NODE_ENV === 'development' || !process.env.MONGO_URI) {
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    } else {
      mongoUri = process.env.MONGO_URI;
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to database');

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Insert sample events
    const result = await Event.insertMany(sampleEvents);
    console.log(`✅ Seeded ${result.length} events successfully!`);

    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedEvents();
