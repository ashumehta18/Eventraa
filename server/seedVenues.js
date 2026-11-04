const mongoose = require('mongoose');
require('dotenv').config();
const Venue = require('./models/Venue');

const sampleVenues = [
  {
    name: "Grand Convention Center",
    description: "A luxurious venue perfect for large events and conferences with state-of-the-art facilities",
    location: {
      address: "123 Business District, MG Road",
      city: "Bangalore",
      state: "Karnataka",
      country: "India"
    },
    capacity: {
      min: 50,
      max: 500
    },
    amenities: ["Air Conditioning", "Audio/Visual Equipment", "Parking", "WiFi", "Catering Kitchen"],
    images: [
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=60"
    ],
    contactInfo: {
      phone: "+91-9876543210",
      email: "contact@grandconvention.com",
      website: "www.grandconvention.com"
    },
    pricing: {
      basePrice: 25000,
      currency: "INR"
    },
    availability: {
      isAvailable: true
    }
  },
  {
    name: "Royal Banquet Hall",
    description: "Elegant hall suitable for weddings and celebrations with traditional Indian architecture",
    location: {
      address: "456 Palace Road, Koramangala",
      city: "Bangalore",
      state: "Karnataka",
      country: "India"
    },
    capacity: {
      min: 30,
      max: 300
    },
    amenities: ["Decorative Lighting", "Dance Floor", "Parking", "Sound System", "Bridal Room"],
    images: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&auto=format&fit=crop&q=60"
    ],
    contactInfo: {
      phone: "+91-9876543211",
      email: "events@royalbanquet.com",
      website: "www.royalbanquet.com"
    },
    pricing: {
      basePrice: 15000,
      currency: "INR"
    },
    availability: {
      isAvailable: true
    }
  },
  {
    name: "Tech Hub Auditorium",
    description: "Modern auditorium perfect for tech conferences and seminars with cutting-edge technology",
    location: {
      address: "789 Electronic City, Hosur Road",
      city: "Bangalore",
      state: "Karnataka",
      country: "India"
    },
    capacity: {
      min: 100,
      max: 800
    },
    amenities: ["Projection System", "High-Speed WiFi", "Recording Equipment", "Climate Control", "Cafeteria"],
    images: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=60"
    ],
    contactInfo: {
      phone: "+91-9876543212",
      email: "bookings@techhub.com",
      website: "www.techhub.com"
    },
    pricing: {
      basePrice: 35000,
      currency: "INR"
    },
    availability: {
      isAvailable: true
    }
  },
  {
    name: "Lakeside Resort",
    description: "Serene lakeside venue perfect for destination weddings and corporate retreats",
    location: {
      address: "12 Lake View Drive, Whitefield",
      city: "Bangalore",
      state: "Karnataka",
      country: "India"
    },
    capacity: {
      min: 20,
      max: 200
    },
    amenities: ["Lake View", "Outdoor Ceremony Area", "Accommodation", "Swimming Pool", "Spa Services"],
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=60"
    ],
    contactInfo: {
      phone: "+91-9876543213",
      email: "events@lakesideresort.com",
      website: "www.lakesideresort.com"
    },
    pricing: {
      basePrice: 40000,
      currency: "INR"
    },
    availability: {
      isAvailable: true
    }
  },
  {
    name: "Heritage Palace",
    description: "Historic palace venue offering royal ambiance for premium events and weddings",
    location: {
      address: "88 Heritage Street, JP Nagar",
      city: "Bangalore",
      state: "Karnataka",
      country: "India"
    },
    capacity: {
      min: 40,
      max: 400
    },
    amenities: ["Heritage Architecture", "Royal Gardens", "Vintage Decor", "Classical Music", "Fine Dining"],
    images: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1520637836862-4d197d17c0a4?w=800&auto=format&fit=crop&q=60"
    ],
    contactInfo: {
      phone: "+91-9876543214",
      email: "bookings@heritagepalace.com",
      website: "www.heritagepalace.com"
    },
    pricing: {
      basePrice: 60000,
      currency: "INR"
    },
    availability: {
      isAvailable: true
    }
  },
  {
    name: "Skyline Rooftop",
    description: "Modern rooftop venue with stunning city views, perfect for cocktail parties and corporate events",
    location: {
      address: "45 Tower Plaza, UB City Mall",
      city: "Bangalore",
      state: "Karnataka",
      country: "India"
    },
    capacity: {
      min: 25,
      max: 150
    },
    amenities: ["City Skyline View", "Open Bar", "DJ Setup", "LED Lighting", "Climate Control"],
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1554774853-719586f82d77?w=800&auto=format&fit=crop&q=60"
    ],
    contactInfo: {
      phone: "+91-9876543215",
      email: "events@skylinerooftop.com",
      website: "www.skylinerooftop.com"
    },
    pricing: {
      basePrice: 30000,
      currency: "INR"
    },
    availability: {
      isAvailable: true
    }
  },
  {
    name: "Garden Paradise",
    description: "Beautiful garden venue surrounded by lush greenery, ideal for outdoor ceremonies and receptions",
    location: {
      address: "67 Garden Hills, Indiranagar",
      city: "Bangalore",
      state: "Karnataka",
      country: "India"
    },
    capacity: {
      min: 35,
      max: 250
    },
    amenities: ["Botanical Gardens", "Outdoor Pavilion", "Natural Lighting", "Eco-Friendly Setup", "Garden Restaurant"],
    images: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&auto=format&fit=crop&q=60"
    ],
    contactInfo: {
      phone: "+91-9876543216",
      email: "bookings@gardenparadise.com",
      website: "www.gardenparadise.com"
    },
    pricing: {
      basePrice: 18000,
      currency: "INR"
    },
    availability: {
      isAvailable: true
    }
  },
  {
    name: "Metropolitan Conference Center",
    description: "Large-scale conference center with multiple halls and advanced technology infrastructure",
    location: {
      address: "101 Business Bay, Outer Ring Road",
      city: "Bangalore",
      state: "Karnataka",
      country: "India"
    },
    capacity: {
      min: 200,
      max: 1500
    },
    amenities: ["Multiple Conference Halls", "Simultaneous Translation", "Live Streaming", "Exhibition Space", "Business Lounge"],
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&auto=format&fit=crop&q=60"
    ],
    contactInfo: {
      phone: "+91-9876543217",
      email: "conferences@metropolitancenter.com",
      website: "www.metropolitancenter.com"
    },
    pricing: {
      basePrice: 45000,
      currency: "INR"
    },
    availability: {
      isAvailable: true
    }
  }
];

async function seedVenues() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing venues
    await Venue.deleteMany({});
    console.log('Cleared existing venues');

    // Insert sample venues
    const venues = await Venue.insertMany(sampleVenues);
    console.log(`${venues.length} venues created successfully`);
    
    venues.forEach(venue => {
      console.log(`- ${venue.name} (ID: ${venue._id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding venues:', error);
    process.exit(1);
  }
}

seedVenues();