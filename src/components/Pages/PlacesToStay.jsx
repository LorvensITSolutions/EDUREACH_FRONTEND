
import React from 'react';
import Layout from "../llayout";
import { MapPin, Star, Phone, Car, Wifi, Utensils, Coffee, Shield } from 'lucide-react';

const PlacesToStay = () => {
  const accommodations = [
    {
      name: 'The Solitaire Hotel',
      category: 'Luxury Hotel',
      rating: 5,
      distance: '2.5 km from school',
      price: '₹8,000 - ₹12,000 per night',
      contact: '+91-135-2715000',
      amenities: ['Free WiFi', 'Restaurant', 'Room Service', 'Parking', 'Spa', 'Gym'],
      description: 'Premium luxury hotel with excellent service and modern amenities. Perfect for special occasions and VIP visits.'
    },
    {
      name: 'Hotel Madhuban',
      category: 'Mid-Range Hotel',
      rating: 4,
      distance: '3.2 km from school',
      price: '₹4,000 - ₹6,000 per night',
      contact: '+91-135-2715200',
      amenities: ['Free WiFi', 'Restaurant', 'Parking', 'Conference Room', 'Garden'],
      description: 'Comfortable accommodation with good facilities and convenient location. Popular choice for parent visits.'
    },
    {
      name: 'Seyfert Sarovar Portico',
      category: 'Business Hotel',
      rating: 4,
      distance: '4.1 km from school',
      price: '₹5,000 - ₹7,500 per night',
      contact: '+91-135-2715300',
      amenities: ['Free WiFi', 'Business Center', 'Restaurant', 'Parking', 'Laundry'],
      description: 'Modern business hotel with professional services and comfortable rooms. Ideal for extended stays.'
    },
    {
      name: 'Hotel Great Value',
      category: 'Budget Hotel',
      rating: 3,
      distance: '1.8 km from school',
      price: '₹2,000 - ₹3,500 per night',
      contact: '+91-135-2715400',
      amenities: ['WiFi', 'Restaurant', 'Parking', 'Room Service'],
      description: 'Clean and affordable accommodation with basic amenities. Good value for money option.'
    },
    {
      name: 'Doon Guest House',
      category: 'Guest House',
      rating: 3,
      distance: '1.2 km from school',
      price: '₹1,500 - ₹2,500 per night',
      contact: '+91-135-2715500',
      amenities: ['WiFi', 'Parking', 'Kitchen Access', 'Garden'],
      description: 'Homely atmosphere with personalized service. Perfect for families seeking a comfortable stay.'
    },
    {
      name: 'Himalayan Heights Resort',
      category: 'Resort',
      rating: 4,
      distance: '8.5 km from school',
      price: '₹6,000 - ₹9,000 per night',
      contact: '+91-135-2715600',
      amenities: ['Free WiFi', 'Restaurant', 'Pool', 'Spa', 'Adventure Activities', 'Parking'],
      description: 'Beautiful resort in the hills with scenic views and recreational facilities. Great for weekend stays.'
    }
  ];

  const nearbyAttractions = [
    {
      name: 'Robber\'s Cave',
      distance: '8 km',
      description: 'Natural cave formation with a stream running through it'
    },
    {
      name: 'Sahastradhara',
      distance: '12 km',
      description: 'Beautiful waterfalls with therapeutic sulfur springs'
    },
    {
      name: 'Mindrolling Monastery',
      distance: '6 km',
      description: 'Largest Buddhist monastery in India with stunning architecture'
    },
    {
      name: 'Forest Research Institute',
      distance: '5 km',
      description: 'Colonial architecture and forestry museum'
    }
  ];

  const travelTips = [
    {
      icon: Car,
      title: 'Transportation',
      tips: [
        'Pre-book taxis from Delhi (6-7 hours drive)',
        'Regular bus services from Delhi and other cities',
        'Dehradun airport is 25 km from the city center',
        'Local taxis and auto-rickshaws readily available'
      ]
    },
    {
      icon: Shield,
      title: 'Safety & Security',
      tips: [
        'All recommended hotels have 24/7 security',
        'Keep emergency contact numbers handy',
        'Inform hotel staff about your school visit',
        'Carry valid ID proof for hotel check-in'
      ]
    },
    {
      icon: Coffee,
      title: 'Local Dining',
      tips: [
        'Try local Garhwali cuisine at recommended restaurants',
        'Most hotels offer multi-cuisine restaurants',
        'Street food available but choose reputable vendors',
        'Vegetarian options widely available'
      ]
    },
    {
      icon: MapPin,
      title: 'Location Tips',
      tips: [
        'Book accommodations closer to school for convenience',
        'Check traffic conditions during peak hours',
        'Weather can be unpredictable, pack accordingly',
        'Monsoon season (July-September) requires extra caution'
      ]
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-accent fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <Layout 
      title="Places To Stay In Dehradun" 
      subtitle="Comfortable accommodation options for visiting families"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-6">Welcome to Dehradun</h2>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            Dehradun, nestled in the foothills of the Himalayas, offers a variety of accommodation 
            options for families visiting The EduReach. From luxury hotels to budget-friendly 
            guest houses, you'll find comfortable stays that suit your preferences and budget.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We've carefully selected and recommended these accommodations based on their proximity 
            to the school, quality of service, and positive feedback from our school community. 
            All options provide easy access to the campus and local attractions.
          </p>
        </div>

        {/* Accommodation Options */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-primary text-center mb-8">Recommended Accommodations</h2>
          {accommodations.map((hotel, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-primary">{hotel.name}</h3>
                    <span className="bg-accent text-primary px-3 py-1 rounded-full text-sm font-semibold">
                      {hotel.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center">
                      {renderStars(hotel.rating)}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {hotel.distance}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-1" />
                      {hotel.contact}
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-4">{hotel.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {hotel.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 bg-accent rounded-full mr-2 flex-shrink-0"></span>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:text-right">
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="text-sm text-gray-600 mb-1">Price Range</div>
                    <div className="text-lg font-bold text-primary">{hotel.price}</div>
                  </div>
                  <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300 font-semibold w-full lg:w-auto">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Travel Tips */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-8">Travel Tips & Information</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {travelTips.map((tip, index) => {
              const IconComponent = tip.icon;
              return (
                <div key={index} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <IconComponent className="w-6 h-6 text-primary mr-3" />
                    <h3 className="text-xl font-bold text-primary">{tip.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {tip.tips.map((tipItem, idx) => (
                      <li key={idx} className="flex items-start text-gray-700 text-sm">
                        <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {tipItem}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nearby Attractions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-primary mb-6">Nearby Attractions</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            While visiting Dehradun, take the opportunity to explore some of the beautiful 
            attractions the region has to offer. These destinations are perfect for extending 
            your stay and experiencing the natural beauty of Uttarakhand.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {nearbyAttractions.map((attraction, index) => (
              <div key={index} className="flex items-start p-4 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-accent mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-primary mb-1">{attraction.name}</h3>
                  <p className="text-sm text-accent font-semibold mb-2">{attraction.distance} from city center</p>
                  <p className="text-gray-700 text-sm">{attraction.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Assistance */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6">Need Booking Assistance?</h2>
          <p className="text-lg leading-relaxed mb-6">
            Our school administration can help you with accommodation recommendations and booking 
            assistance. We maintain relationships with local hotels to ensure our families receive 
            the best possible service and rates.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h3 className="font-bold text-accent mb-3">School Assistance</h3>
              <p className="text-sm mb-2">Contact our administration office for booking help</p>
              <p className="text-sm">Phone: +91-135-2526400</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h3 className="font-bold text-accent mb-3">Special Rates</h3>
              <p className="text-sm mb-2">Mention The EduReach for potential discounts</p>
              <p className="text-sm">Some hotels offer special rates for school families</p>
            </div>
          </div>
        </div>

        {/* Contact for More Information */}
        <div className="bg-accent text-primary rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Plan Your Visit</h2>
          <p className="text-lg mb-6 leading-relaxed">
            For more information about accommodations, local attractions, or assistance with 
            planning your visit to Dehradun, please contact our administration office.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300 font-semibold">
              Contact Administration
            </button>
            <button className="border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors duration-300 font-semibold">
              Download Visitor Guide
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PlacesToStay;