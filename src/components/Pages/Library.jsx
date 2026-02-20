import { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Star, 
  Calendar,
  User,
  Clock,
  Download,
  Heart,
  Eye
} from 'lucide-react';

const Library = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const books = [
    {
      id: 1,
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      category: 'Fiction',
      type: 'Physical',
      isbn: '978-0-06-112008-4',
      available: true,
      rating: 4.8,
      image: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=1',
      description: 'A classic American novel dealing with serious issues of rape and racial inequality.',
      publishedYear: 1960,
      pages: 376,
      downloads: 1250,
      views: 3200
    },
    {
      id: 2,
      title: 'Advanced Mathematics',
      author: 'John Smith',
      category: 'Academic',
      type: 'Digital',
      isbn: '978-0-13-394728-4',
      available: true,
      rating: 4.5,
      image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=1',
      description: 'Comprehensive guide to advanced mathematical concepts and problem-solving techniques.',
      publishedYear: 2023,
      pages: 520,
      downloads: 850,
      views: 2100
    },
    {
      id: 3,
      title: 'World History Encyclopedia',
      author: 'Multiple Authors',
      category: 'Reference',
      type: 'Digital',
      isbn: '978-0-19-956077-1',
      available: true,
      rating: 4.7,
      image: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=1',
      description: 'Complete reference guide covering world history from ancient times to modern era.',
      publishedYear: 2022,
      pages: 1200,
      downloads: 2300,
      views: 5600
    },
    {
      id: 4,
      title: 'Introduction to Computer Science',
      author: 'Sarah Johnson',
      category: 'Technology',
      type: 'Physical',
      isbn: '978-0-262-03384-8',
      available: false,
      rating: 4.6,
      image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=1',
      description: 'Beginner-friendly introduction to programming and computer science fundamentals.',
      publishedYear: 2023,
      pages: 450,
      downloads: 1800,
      views: 4200
    },
    {
      id: 5,
      title: 'Environmental Science',
      author: 'Dr. Michael Green',
      category: 'Science',
      type: 'Digital',
      isbn: '978-0-07-802389-4',
      available: true,
      rating: 4.4,
      image: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=1',
      description: 'Comprehensive study of environmental issues and sustainability practices.',
      publishedYear: 2023,
      pages: 380,
      downloads: 920,
      views: 2800
    },
    {
      id: 6,
      title: 'Poetry Collection',
      author: 'Various Poets',
      category: 'Literature',
      type: 'Physical',
      isbn: '978-0-375-71367-5',
      available: true,
      rating: 4.3,
      image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=1',
      description: 'Collection of contemporary and classic poetry from renowned poets.',
      publishedYear: 2022,
      pages: 280,
      downloads: 650,
      views: 1900
    }
  ];

  const categories = ['all', 'Fiction', 'Academic', 'Reference', 'Technology', 'Science', 'Literature'];
  const types = ['all', 'Physical', 'Digital'];

  const filteredBooks = books
    .filter(book => 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(book => selectedCategory === 'all' || book.category === selectedCategory)
    .filter(book => selectedType === 'all' || book.type === selectedType);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} className="text-yellow-400 fill-current" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} className="text-yellow-400 fill-current opacity-50" />);
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} className="text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Digital Library</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our extensive collection of books, research materials, and digital resources
          </p>
        </div>

        {/* Library Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Books', value: '12,500+', icon: BookOpen, color: 'bg-blue-500' },
            { title: 'Digital Resources', value: '8,200+', icon: Download, color: 'bg-green-500' },
            { title: 'Active Members', value: '2,400+', icon: User, color: 'bg-purple-500' },
            { title: 'Monthly Downloads', value: '15,600+', icon: Download, color: 'bg-orange-500' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg card-hover">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mr-4`}>
                  <stat.icon className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search books, authors, ISBN..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-white rounded-xl shadow-lg overflow-hidden card-hover">
              <div className="relative">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    book.type === 'Digital' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {book.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    book.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {book.available ? 'Available' : 'Checked Out'}
                  </span>
                </div>
                <button className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                  <Heart size={16} className="text-gray-600 hover:text-red-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-3">
                  <span className="text-sm text-primary font-medium">{book.category}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
                <p className="text-gray-600 text-sm mb-3">by {book.author}</p>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{book.description}</p>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {renderStars(book.rating)}
                  </div>
                  <span className="text-sm text-gray-600">({book.rating})</span>
                </div>

                {/* Book Details */}
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    <span>{book.publishedYear}</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen size={12} className="mr-1" />
                    <span>{book.pages} pages</span>
                  </div>
                  <div className="flex items-center">
                    <Download size={12} className="mr-1" />
                    <span>{book.downloads}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye size={12} className="mr-1" />
                    <span>{book.views}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {book.available ? (
                    <>
                      <button className="flex-1 btn-primary text-sm py-2">
                        {book.type === 'Digital' ? 'Read Online' : 'Borrow'}
                      </button>
                      {book.type === 'Digital' && (
                        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Download size={16} />
                        </button>
                      )}
                    </>
                  ) : (
                    <button className="flex-1 bg-gray-100 text-gray-500 py-2 rounded-lg text-sm cursor-not-allowed">
                      Currently Unavailable
                    </button>
                  )}
                </div>

                {/* ISBN */}
                <div className="mt-3 text-xs text-gray-400">
                  ISBN: {book.isbn}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Library Services */}
        <div className="mt-16 bg-gradient-to-r from-primary to-primary-light rounded-xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Library Services</h2>
            <p className="text-lg mb-8">
              Access our full range of library services and resources
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Research Assistance',
                  description: 'Get help with your research projects from our librarians',
                  icon: Search
                },
                {
                  title: 'Study Rooms',
                  description: 'Book quiet study spaces for individual or group work',
                  icon: BookOpen
                },
                {
                  title: 'Digital Resources',
                  description: 'Access online databases, journals, and digital collections',
                  icon: Download
                }
              ].map((service, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <service.icon size={32} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                  <p className="text-sm opacity-90">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;