
// Sample providers data with extended information
export const providersData = [
  {
    id: 1,
    name: "John Kamau",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    rating: 4.8,
    reviews: 152,
    location: "Nairobi, Kenya",
    phone: "+254 712 345 678",
    email: "john.kamau@example.com",
    services: ["House Cleaning", "Gardening"],
    bio: "Professional cleaner with over a decade of experience in residential and commercial cleaning services. I take pride in delivering spotless results and ensuring customer satisfaction with every job. My approach combines traditional cleaning techniques with modern, eco-friendly products to provide the highest quality service while respecting your home and the environment.",
    availability: {
      monday: "8:00 AM - 5:00 PM",
      tuesday: "8:00 AM - 5:00 PM",
      wednesday: "8:00 AM - 5:00 PM",
      thursday: "8:00 AM - 5:00 PM",
      friday: "8:00 AM - 3:00 PM",
      saturday: "9:00 AM - 1:00 PM",
      sunday: "Unavailable"
    },
    appointments: [
      {
        id: 101,
        client: "Sarah Johnson",
        service: "House Cleaning",
        date: new Date(2023, 11, 22, 10, 30),
        status: "confirmed",
        clientPhone: "+254 712 987 654",
        location: "123 Main St, Nairobi",
        notes: "Focus on kitchen and bathrooms"
      },
      {
        id: 102,
        client: "Michael Brown",
        service: "Gardening",
        date: new Date(2023, 11, 23, 14, 0),
        status: "pending",
        clientPhone: "+254 723 456 789",
        location: "456 Oak Ave, Nairobi",
        notes: "Lawn mowing and hedge trimming"
      }
    ],
    completedJobs: 87,
    totalEarnings: 120000,
    averageRating: 4.8,
    reviewsReceived: [
      {
        id: 201,
        client: "David Smith",
        rating: 5,
        comment: "Excellent service! Very professional and thorough.",
        date: "2 days ago"
      },
      {
        id: 202,
        client: "Jessica Lee",
        rating: 4,
        comment: "Great job, but arrived a bit late.",
        date: "1 week ago"
      }
    ]
  },
  {
    id: 2,
    name: "Sarah Njeri",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    rating: 4.7,
    reviews: 98,
    location: "Mombasa, Kenya",
    phone: "+254 723 456 789",
    email: "sarah.njeri@example.com",
    services: ["Plumbing", "Electrical"],
    bio: "Certified plumber with expertise in both installation and repairs for residential plumbing systems. With 8 years of field experience, I specialize in fixing leaks, installing fixtures, and troubleshooting complex plumbing issues. I'm dedicated to providing timely, reliable service and always ensure that each job is completed to the highest standards of quality and safety.",
    availability: {
      monday: "7:00 AM - 4:00 PM",
      tuesday: "7:00 AM - 4:00 PM",
      wednesday: "7:00 AM - 4:00 PM",
      thursday: "7:00 AM - 4:00 PM",
      friday: "7:00 AM - 4:00 PM",
      saturday: "9:00 AM - 12:00 PM",
      sunday: "Unavailable"
    },
    appointments: [
      {
        id: 103,
        client: "Robert Davis",
        service: "Plumbing",
        date: new Date(2023, 11, 24, 9, 0),
        status: "confirmed",
        clientPhone: "+254 734 567 890",
        location: "789 Pine St, Mombasa",
        notes: "Leaky faucet repair"
      },
      {
        id: 104,
        client: "Jennifer Smith",
        service: "Electrical",
        date: new Date(2023, 11, 25, 11, 0),
        status: "pending",
        clientPhone: "+254 745 678 901",
        location: "101 Beach Rd, Mombasa",
        notes: "Install new ceiling lights"
      }
    ],
    completedJobs: 65,
    totalEarnings: 95000,
    averageRating: 4.7,
    reviewsReceived: [
      {
        id: 203,
        client: "Robert Johnson",
        rating: 5,
        comment: "Sarah did an amazing job fixing our plumbing issues. Very knowledgeable!",
        date: "3 days ago"
      },
      {
        id: 204,
        client: "Emily Wilson",
        rating: 4,
        comment: "Fixed our electrical issue quickly. Would recommend.",
        date: "2 weeks ago"
      }
    ]
  },
  {
    id: 3,
    name: "David Mwangi",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
    rating: 4.9,
    reviews: 215,
    location: "Kisumu, Kenya",
    phone: "+254 734 567 890",
    email: "david.mwangi@example.com",
    services: ["Electrical", "Furniture Assembly"],
    bio: "Licensed electrician specialized in home electrical systems, wiring, and lighting installations. With over 12 years of professional experience, I've worked on projects ranging from simple repairs to complete electrical system installations. Safety is my top priority, and I ensure all work complies with the latest electrical codes and standards. I'm known for my attention to detail and clean, professional work.",
    availability: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 6:00 PM",
      saturday: "10:00 AM - 2:00 PM",
      sunday: "Unavailable"
    },
    appointments: [
      {
        id: 105,
        client: "Thomas Johnson",
        service: "Electrical",
        date: new Date(2023, 11, 20, 15, 0),
        status: "completed",
        clientPhone: "+254 756 789 012",
        location: "202 Sunset Blvd, Kisumu",
        notes: "Rewire living room"
      },
      {
        id: 106,
        client: "Amanda Garcia",
        service: "Furniture Assembly",
        date: new Date(2023, 11, 26, 13, 0),
        status: "confirmed",
        clientPhone: "+254 767 890 123",
        location: "303 Lake View, Kisumu",
        notes: "Assemble new bedroom set"
      }
    ],
    completedJobs: 132,
    totalEarnings: 180000,
    averageRating: 4.9,
    reviewsReceived: [
      {
        id: 205,
        client: "Michael Brown",
        rating: 5,
        comment: "David is incredibly skilled and professional. Fixed our electrical problems quickly.",
        date: "1 week ago"
      },
      {
        id: 206,
        client: "Sarah Miller",
        rating: 5,
        comment: "Assembled our furniture perfectly. Very precise work!",
        date: "3 weeks ago"
      }
    ]
  },
  {
    id: 4,
    name: "Mary Wanjiku",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
    rating: 4.6,
    reviews: 87,
    location: "Nakuru, Kenya",
    phone: "+254 745 678 901",
    email: "mary.wanjiku@example.com",
    services: ["Painting", "House Cleaning"],
    bio: "Professional painter with skills in interior and exterior painting, color consultation, and surface preparation. I've transformed hundreds of homes across Kenya with fresh, expertly applied paint. My services include color matching, texture application, and specialized finishing techniques. I work efficiently and neatly, always protecting your furniture and belongings during the painting process.",
    availability: {
      monday: "8:30 AM - 5:30 PM",
      tuesday: "8:30 AM - 5:30 PM",
      wednesday: "8:30 AM - 5:30 PM",
      thursday: "8:30 AM - 5:30 PM",
      friday: "8:30 AM - 5:30 PM",
      saturday: "Unavailable",
      sunday: "Unavailable"
    },
    appointments: [
      {
        id: 107,
        client: "Daniel Lee",
        service: "Painting",
        date: new Date(2023, 11, 27, 10, 0),
        status: "confirmed",
        clientPhone: "+254 778 901 234",
        location: "404 Hillside Dr, Nakuru",
        notes: "Paint living room and kitchen"
      },
      {
        id: 108,
        client: "Lisa Chen",
        service: "House Cleaning",
        date: new Date(2023, 11, 19, 14, 0),
        status: "completed",
        clientPhone: "+254 789 012 345",
        location: "505 Valley Rd, Nakuru",
        notes: "Deep cleaning of entire house"
      }
    ],
    completedJobs: 58,
    totalEarnings: 85000,
    averageRating: 4.6,
    reviewsReceived: [
      {
        id: 207,
        client: "James Wilson",
        rating: 5,
        comment: "Mary's painting work is excellent. Very clean and precise.",
        date: "2 weeks ago"
      },
      {
        id: 208,
        client: "Sophia Martinez",
        rating: 4,
        comment: "Good cleaning job overall. Missed a few spots but came back to fix it.",
        date: "1 month ago"
      }
    ]
  },
  {
    id: 5,
    name: "Peter Ochieng",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    rating: 4.5,
    reviews: 76,
    location: "Eldoret, Kenya",
    phone: "+254 756 789 012",
    email: "peter.ochieng@example.com",
    services: ["Gardening", "Furniture Assembly"],
    bio: "Experienced gardener offering landscaping, garden maintenance, and plant care services. With a deep knowledge of local plant species and growing conditions, I can help you create and maintain a beautiful, thriving garden. My services include lawn care, pruning, planting, irrigation system installation, and garden design. I'm passionate about creating outdoor spaces that enhance your home and provide joy for years to come.",
    availability: {
      monday: "7:30 AM - 4:30 PM",
      tuesday: "7:30 AM - 4:30 PM",
      wednesday: "7:30 AM - 4:30 PM",
      thursday: "7:30 AM - 4:30 PM",
      friday: "7:30 AM - 4:30 PM",
      saturday: "8:00 AM - 12:00 PM",
      sunday: "Unavailable"
    },
    appointments: [
      {
        id: 109,
        client: "William Taylor",
        service: "Gardening",
        date: new Date(2023, 11, 28, 9, 0),
        status: "confirmed",
        clientPhone: "+254 790 123 456",
        location: "606 Green St, Eldoret",
        notes: "Lawn maintenance and new plant installation"
      },
      {
        id: 110,
        client: "Emma Rodriguez",
        service: "Furniture Assembly",
        date: new Date(2023, 11, 29, 14, 0),
        status: "pending",
        clientPhone: "+254 701 234 567",
        location: "707 Mountain View, Eldoret",
        notes: "Assemble new dining set"
      }
    ],
    completedJobs: 45,
    totalEarnings: 65000,
    averageRating: 4.5,
    reviewsReceived: [
      {
        id: 209,
        client: "Charles Anderson",
        rating: 4,
        comment: "Peter did good work on our garden. Everything looks much better now.",
        date: "1 week ago"
      },
      {
        id: 210,
        client: "Olivia Thompson",
        rating: 5,
        comment: "Excellent furniture assembly. Very careful and precise work.",
        date: "3 weeks ago"
      }
    ]
  },
  {
    id: 6,
    name: "Jane Akinyi",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    rating: 4.8,
    reviews: 124,
    location: "Thika, Kenya",
    phone: "+254 767 890 123",
    email: "jane.akinyi@example.com",
    services: ["Plumbing", "Painting"],
    bio: "Versatile handywoman with expertise in multiple areas including plumbing and home painting. With 6 years of experience handling various home repair and improvement projects, I can efficiently tackle multiple tasks in a single visit. I pride myself on honest pricing, punctuality, and quality workmanship. Whether you need minor repairs or major improvements, I have the skills and tools to get the job done right.",
    availability: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "10:00 AM - 2:00 PM",
      sunday: "Unavailable"
    },
    appointments: [
      {
        id: 111,
        client: "Kevin Wilson",
        service: "Plumbing",
        date: new Date(2023, 11, 30, 11, 0),
        status: "confirmed",
        clientPhone: "+254 712 345 678",
        location: "808 Coffee Rd, Thika",
        notes: "Fix bathroom sink and shower"
      },
      {
        id: 112,
        client: "Natalie Moore",
        service: "Painting",
        date: new Date(2023, 12, 1, 9, 0),
        status: "pending",
        clientPhone: "+254 723 456 789",
        location: "909 Tea Lane, Thika",
        notes: "Paint two bedrooms"
      }
    ],
    completedJobs: 78,
    totalEarnings: 110000,
    averageRating: 4.8,
    reviewsReceived: [
      {
        id: 211,
        client: "Christopher Harris",
        rating: 5,
        comment: "Jane is amazing! Fixed our plumbing issues quickly and professionally.",
        date: "4 days ago"
      },
      {
        id: 212,
        client: "Melissa Davis",
        rating: 5,
        comment: "Beautiful paint job. Very neat work with great attention to detail.",
        date: "2 weeks ago"
      }
    ]
  },
];

// Helper function to get a provider by ID
export const getProviderById = (id: number) => {
  return providersData.find(provider => provider.id === id);
};

// Helper function to get upcoming appointments for a provider
export const getProviderAppointments = (providerId: number) => {
  const provider = getProviderById(providerId);
  return provider?.appointments || [];
};

// Helper function to get completed appointments for a provider
export const getProviderCompletedJobs = (providerId: number) => {
  return getProviderById(providerId)?.completedJobs || 0;
};

// Helper function to get provider reviews
export const getProviderReviews = (providerId: number) => {
  return getProviderById(providerId)?.reviewsReceived || [];
};

// Helper function to get provider earnings
export const getProviderEarnings = (providerId: number) => {
  return getProviderById(providerId)?.totalEarnings || 0;
};

