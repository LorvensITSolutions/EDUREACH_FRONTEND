import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, X, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

const carouselData = [
  {
    id: 1,
    title: 'Academics',
    image: 'https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Excellence in learning and academic achievement',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '2:45'
  },
  {
    id: 2,
    title: 'Co-curriculars',
    image: 'https://images.pexels.com/photos/1516440/pexels-photo-1516440.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Creative activities and skill development',
    videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
    duration: '3:12'
  },
  {
    id: 3,
    title: 'Sports',
    image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Physical fitness and team spirit',
    videoUrl: 'https://www.youtube.com/embed/JGwWNGJdvx8',
    duration: '4:28'
  },
  {
    id: 4,
    title: 'Main Houses',
    image: 'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Community living and house traditions',
    videoUrl: 'https://www.youtube.com/embed/fJ9rUzIMcZQ',
    duration: '5:15'
  }
];

const EduReachCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isAutoPlaying || isModalOpen) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === carouselData.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isModalOpen]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === 0 ? carouselData.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === carouselData.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const openVideo = (video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
    setIsAutoPlaying(false);
  };

  const closeVideo = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
    setIsFullscreen(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeVideo();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4 animate-fade-in">
          Life at EduReach
        </h2>
        <div className="w-24 h-1 bg-accent mx-auto rounded-full"></div>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {carouselData.map((item, index) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 animate-bounce-in"
            onClick={() => openVideo(item)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="aspect-[4/3] relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

              {/* Duration Badge */}
              <div className="absolute top-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                {item.duration}
              </div>

              {/* Play Button */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-accent-dark">
                  <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                </div>
              </div>

              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-accent-light transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-200 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Carousel View */}
      <div className="md:hidden relative">
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {carouselData.map((item) => (
              <div 
                key={item.id} 
                className="w-full flex-shrink-0 relative cursor-pointer"
                onClick={() => openVideo(item)}
              >
                <div className="aspect-[4/3] relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                  {/* Duration Badge */}
                  <div className="absolute top-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                    {item.duration}
                  </div>

                  {/* Play Button */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-200 text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center justify-center space-x-4 mt-6">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-full bg-primary hover:bg-primary-dark text-white transition-colors duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex space-x-2">
            {carouselData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex ? 'bg-accent' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            className="p-2 rounded-full bg-primary hover:bg-primary-dark text-white transition-colors duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Navigation Arrows */}
      <div className="hidden md:flex justify-center items-center space-x-6 mt-8">
        <button
          onClick={goToPrevious}
          className="p-3 rounded-full bg-primary hover:bg-primary-dark text-white transition-all duration-200 hover:scale-110 shadow-lg"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex space-x-3">
          {carouselData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-200 hover:scale-110 ${
                index === currentIndex ? 'bg-accent shadow-lg' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          className="p-3 rounded-full bg-primary hover:bg-primary-dark text-white transition-all duration-200 hover:scale-110 shadow-lg"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Auto-play Toggle */}
      <div className="text-center mt-8">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-primary hover:text-primary-dark transition-colors duration-200 text-sm font-medium"
        >
          {isAutoPlaying ? 'Pause Auto-play' : 'Resume Auto-play'}
        </button>
      </div>

      {/* Video Modal */}
      {isModalOpen && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className={`relative w-full max-w-6xl mx-auto ${isFullscreen ? 'h-full' : 'max-h-[90vh]'} animate-fade-in`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-black/50 rounded-t-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SH</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    Life At EduReach - {selectedVideo.title}
                  </h3>
                  <p className="text-gray-300 text-sm">EduReach Official</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition-colors duration-200"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition-colors duration-200"
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
                <button
                  onClick={closeVideo}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div className={`relative bg-black ${isFullscreen ? 'h-full' : 'aspect-video'} rounded-b-lg overflow-hidden`}>
              <iframe
                src={`${selectedVideo.videoUrl}?autoplay=1&mute=${isMuted ? 1 : 0}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={selectedVideo.title}
              ></iframe>
              
              {/* Custom Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="w-full bg-white/30 rounded-full h-1">
                      <div className="bg-accent h-1 rounded-full" style={{ width: '33%' }}></div>
                    </div>
                  </div>
                  <span className="text-white text-sm font-medium">
                    1:23 / {selectedVideo.duration}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Description */}
            <div className="mt-4 p-4 bg-black/50 rounded-lg">
              <p className="text-gray-300 text-sm leading-relaxed">
                {selectedVideo.description}
              </p>
              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                <span>EduReach Official</span>
                <span>•</span>
                <span>Published on Dec 15, 2024</span>
                <span>•</span>
                <span>2.5K views</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EduReachCarousel;