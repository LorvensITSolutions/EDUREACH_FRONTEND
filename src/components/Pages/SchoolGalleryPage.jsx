import React, { useState, useRef, useEffect } from "react";

const dummyImages = [
  { src: "https://picsum.photos/800/600?random=1", title: "Morning Sunrise", description: "Golden hour magic captured in perfect light" },
  { src: "https://picsum.photos/800/600?random=2", title: "Ocean Waves", description: "Rhythmic dance of endless blue waters" },
  { src: "https://picsum.photos/800/600?random=3", title: "Forest Path", description: "Mysterious trail through ancient woods" },
  { src: "https://picsum.photos/800/600?random=4", title: "City Lights", description: "Urban symphony of neon and shadows" },
  { src: "https://picsum.photos/800/600?random=5", title: "Mountain Peak", description: "Majestic heights touching cloudy skies" },
  { src: "https://picsum.photos/800/600?random=6", title: "Desert Dunes", description: "Endless waves of golden sand sculptures" },
  { src: "https://picsum.photos/800/600?random=7", title: "Flower Garden", description: "Nature's colorful masterpiece in bloom" },
  { src: "https://picsum.photos/800/600?random=8", title: "Starry Night", description: "Cosmic ballet across midnight canvas" },
  { src: "https://picsum.photos/800/600?random=9", title: "Waterfall", description: "Cascading symphony of pure crystal water" },
  { src: "https://picsum.photos/800/600?random=10", title: "Autumn Leaves", description: "Nature's farewell painted in gold and amber" },
  { src: "https://picsum.photos/800/600?random=11", title: "Stone Bridge", description: "Ancient architecture spanning time itself" },
  { src: "https://picsum.photos/800/600?random=12", title: "Butterfly", description: "Delicate wings carrying dreams on gentle breeze" },
];

const dummyVideos = [
  {
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Creative Workshop",
    description: "Innovative minds crafting the future with passion",
    duration: "2:45",
    thumbnail: "https://picsum.photos/400/300?random=20"
  },
  {
    url: "https://www.w3schools.com/html/movie.mp4",
    title: "Innovation Summit",
    description: "Breakthrough ideas reshaping tomorrow's possibilities",
    duration: "4:12",
    thumbnail: "https://picsum.photos/400/300?random=21"
  },
  {
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Nature Documentary",
    description: "Wildlife secrets revealed through cinematic storytelling",
    duration: "8:30",
    thumbnail: "https://picsum.photos/400/300?random=22"
  },
  {
    url: "https://www.w3schools.com/html/movie.mp4",
    title: "Tech Revolution",
    description: "Digital transformation changing our world forever",
    duration: "3:55",
    thumbnail: "https://picsum.photos/400/300?random=23"
  },
];

const GalleryApp = () => {
  const [activeTab, setActiveTab] = useState("images");
  const [viewFullVideo, setViewFullVideo] = useState(null);
  const [floatingVideo, setFloatingVideo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isGridView, setIsGridView] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [hoveredVideo, setHoveredVideo] = useState(null);

  const videoRef = useRef(null);
  const floatingRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setViewFullVideo(null);
        setSelectedImage(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`
        relative px-4 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-lg transition-all duration-500 transform
        ${isActive 
          ? 'bg-gradient-to-r from-[#00796B] to-[#4DB6AC] text-white shadow-2xl scale-105' 
          : 'bg-white/20 backdrop-blur-sm text-[#212121] hover:bg-white/40 hover:scale-102'
        }
        border-2 ${isActive ? 'border-[#FBC02D]' : 'border-transparent'}
        hover:shadow-xl
      `}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-lg sm:text-2xl">{icon}</span>
        <span className="hidden sm:inline">{label}</span>
      </div>
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#FBC02D] rounded-full animate-pulse" />
      )}
    </button>
  );

  const ImageCard = ({ item, index, isGridView }) => (
    <div
      className={`
        group relative overflow-hidden rounded-3xl cursor-pointer transform transition-all duration-700
        ${isGridView 
          ? 'aspect-square hover:scale-105 hover:rotate-1' 
          : 'aspect-[16/9] hover:scale-102'
        }
        bg-gradient-to-br from-[#4DB6AC]/20 to-[#00796B]/20 backdrop-blur-sm
        border-2 border-white/30 hover:border-[#FBC02D]/50
        shadow-xl hover:shadow-2xl
      `}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      onClick={() => setSelectedImage(item)}
    >
      <img
        src={item.src}
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      {/* Dynamic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {hoveredIndex === index && (
          <>
            <div className="absolute top-2 right-2 w-2 h-2 bg-[#FBC02D] rounded-full animate-ping" />
            <div className="absolute top-6 right-6 w-1 h-1 bg-white rounded-full animate-pulse delay-100" />
            <div className="absolute top-4 right-10 w-1.5 h-1.5 bg-[#4DB6AC] rounded-full animate-bounce delay-200" />
          </>
        )}
      </div>
      
      {/* Hover content */}
      {hoveredIndex === index && (
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 text-white">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <h3 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-xs sm:text-sm opacity-90 leading-relaxed">{item.description}</p>
          </div>
        </div>
      )}
      
      {/* Corner accent */}
      <div className="absolute top-0 left-0 w-0 h-0 border-l-[30px] sm:border-l-[40px] border-l-[#FBC02D] border-b-[30px] sm:border-b-[40px] border-b-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );

  const VideoCard = ({ video, index }) => (
    <div 
      className="group relative bg-gradient-to-br from-[#00796B]/10 to-[#4DB6AC]/10 backdrop-blur-sm rounded-3xl overflow-hidden border-2 border-white/30 hover:border-[#FBC02D]/50 transition-all duration-500 transform hover:scale-102 hover:shadow-2xl"
      onMouseEnter={() => setHoveredVideo(index)}
      onMouseLeave={() => setHoveredVideo(null)}
    >
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-48 sm:h-64 object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Video overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FBC02D]/90 rounded-full flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FBC02D] shadow-2xl">
            <span className="text-white text-xl sm:text-2xl ml-1">▶</span>
          </div>
        </div>
        
        {/* Duration badge */}
        <div className="absolute top-3 right-3 px-2 py-1 sm:px-3 sm:py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-semibold">
          {video.duration}
        </div>

        {/* Floating particles on hover */}
        {hoveredVideo === index && (
          <>
            <div className="absolute top-4 left-4 w-2 h-2 bg-[#FBC02D] rounded-full animate-ping" />
            <div className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-100" />
          </>
        )}
      </div>
      
      <div className="p-4 sm:p-6 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm">
        <h3 className="font-bold text-lg sm:text-xl text-[#212121] mb-2">{video.title}</h3>
        
        {/* Description on hover */}
        <div className={`overflow-hidden transition-all duration-500 ${hoveredVideo === index ? 'max-h-20 mb-4' : 'max-h-0 mb-0'}`}>
          <p className="text-sm text-[#212121]/70 leading-relaxed">{video.description}</p>
        </div>
        
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setViewFullVideo(video)}
            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-[#00796B] to-[#4DB6AC] text-white rounded-xl sm:rounded-2xl font-semibold transform transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <span className="text-sm sm:text-base">⛶</span>
          </button>
          <button
            onClick={() => setFloatingVideo(video)}
            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-[#FBC02D] to-[#F57F17] text-white rounded-xl sm:rounded-2xl font-semibold transform transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <span className="text-sm sm:text-base">⧉</span>
          </button>
        </div>
      </div>
    </div>
  );

  const displayedImages = showAll ? dummyImages : dummyImages.slice(0, 6);
  const displayedVideos = showAll ? dummyVideos : dummyVideos.slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] via-[#4DB6AC]/5 to-[#FBC02D]/10 p-3 sm:p-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-6xl font-black bg-gradient-to-r from-[#00796B] to-[#FBC02D] bg-clip-text text-transparent mb-2 sm:mb-4">
            Gallery Vision
          </h1>
          <p className="text-sm sm:text-xl text-[#212121]/80 font-medium">Immersive Visual Experience</p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 mb-8 sm:mb-12">
          <TabButton
            id="images"
            label="Images"
            icon="🎨"
            isActive={activeTab === "images"}
            onClick={() => setActiveTab("images")}
          />
          <TabButton
            id="videos"
            label="Videos"
            icon="🎥"
            isActive={activeTab === "videos"}
            onClick={() => setActiveTab("videos")}
          />
          
          {activeTab === "images" && (
            <button
              onClick={() => setIsGridView(!isGridView)}
              className="p-3 sm:p-4 bg-white/30 backdrop-blur-sm rounded-2xl border-2 border-white/50 hover:border-[#FBC02D]/50 transition-all duration-300 hover:scale-105"
            >
              <span className="text-lg sm:text-2xl">{isGridView ? "📋" : "⊞"}</span>
            </button>
          )}
        </div>

        {/* Images Section */}
        {activeTab === "images" && (
          <>
            <div className={`
              grid gap-4 sm:gap-8 transition-all duration-700 mb-8
              ${isGridView 
                ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1 sm:grid-cols-2'
              }
            `}>
              {displayedImages.map((item, index) => (
                <ImageCard key={index} item={item} index={index} isGridView={isGridView} />
              ))}
            </div>

            {/* View More/Less Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#00796B] to-[#4DB6AC] text-white rounded-2xl font-bold text-sm sm:text-lg transform transition-all duration-500 hover:scale-105 hover:shadow-2xl active:scale-95 flex items-center gap-2 sm:gap-3"
              >
                <span>{showAll ? "View Less" : "View More"}</span>
                <span className="text-lg sm:text-xl transform transition-transform duration-300">
                  {showAll ? "↑" : "↓"}
                </span>
              </button>
            </div>
          </>
        )}

        {/* Videos Section */}
        {activeTab === "videos" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8">
              {displayedVideos.map((video, index) => (
                <VideoCard key={index} video={video} index={index} />
              ))}
            </div>

            {/* View More/Less Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#00796B] to-[#4DB6AC] text-white rounded-2xl font-bold text-sm sm:text-lg transform transition-all duration-500 hover:scale-105 hover:shadow-2xl active:scale-95 flex items-center gap-2 sm:gap-3"
              >
                <span>{showAll ? "View Less" : "View More"}</span>
                <span className="text-lg sm:text-xl transform transition-transform duration-300">
                  {showAll ? "↑" : "↓"}
                </span>
              </button>
            </div>
          </>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative max-w-6xl max-h-[90vh] bg-gradient-to-br from-[#00796B]/20 to-[#FBC02D]/20 backdrop-blur-sm rounded-3xl overflow-hidden border-4 border-[#FBC02D]/30">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white text-2xl font-bold mb-2">{selectedImage.title}</h3>
                <p className="text-white/90 text-sm">{selectedImage.description}</p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 bg-[#EF4444] rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold hover:scale-110 transition-transform duration-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Fullscreen Video Modal */}
        {viewFullVideo && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-6xl h-[80vh] bg-gradient-to-br from-[#00796B]/20 to-[#FBC02D]/20 backdrop-blur-sm rounded-3xl overflow-hidden border-4 border-[#FBC02D]/30">
              <video
                ref={videoRef}
                src={viewFullVideo.url}
                controls
                autoPlay
                className="w-full h-full object-contain rounded-3xl"
              />
              <button
                onClick={() => setViewFullVideo(null)}
                className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 bg-[#EF4444] rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold hover:scale-110 transition-transform duration-300 z-10"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Floating Video Player */}
        {floatingVideo && (
          <div
            ref={floatingRef}
            className="fixed bottom-4 right-4 w-72 sm:w-96 z-50 bg-gradient-to-br from-[#00796B] to-[#4DB6AC] rounded-3xl shadow-2xl overflow-hidden border-4 border-[#FBC02D]/50 cursor-move"
            style={{ 
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            <video
              src={floatingVideo.url}
              controls
              autoPlay
              className="w-full h-36 sm:h-48 object-cover"
            />
            <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-sm text-white">
              <div className="flex-1 min-w-0">
                <span className="font-bold text-sm sm:text-lg block truncate">{floatingVideo.title}</span>
                <p className="text-xs sm:text-sm text-[#FBC02D]">Floating Player</p>
              </div>
              <button 
                onClick={() => setFloatingVideo(null)}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-[#EF4444] rounded-full flex items-center justify-center text-white font-bold hover:scale-110 transition-transform duration-300 ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryApp;