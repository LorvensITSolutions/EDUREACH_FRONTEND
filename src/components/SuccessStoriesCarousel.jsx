import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Trophy, Award, Target, Sparkles } from "lucide-react";

const successStories = [
  {
    id: 1,
    title: "Aarav cracked IIT",
    description: "Thanks to our mentorship program, Aarav secured AIR 58 in JEE Advanced.",
    image: "https://images.unsplash.com/photo-1742268350485-40d64a33f5ed?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2fHx8ZW58MHx8fHx8",
    achievement: "AIR 58",
    icon: Trophy,
    gradient: "from-primary to-primary-dark",
    sparkleColor: "text-accent"
  },
  {
    id: 2,
    title: "Priya became an IAS officer",
    description: "She achieved her dream with our mock interview guidance.",
    image: "https://images.unsplash.com/photo-1531177071268-418c3b0b0082",
    achievement: "IAS Officer",
    icon: Award,
    gradient: "from-accent to-accent-dark",
    sparkleColor: "text-primary"
  },
  {
    id: 3,
    title: "Rahul topped state boards",
    description: "Consistent learning with us helped Rahul get 98.7%.",
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61",
    achievement: "98.7%",
    icon: Star,
    gradient: "from-success to-green-600",
    sparkleColor: "text-accent"
  },
  {
    id: 4,
    title: "Sneha won Science Olympiad",
    description: "Our advanced science program helped Sneha win the National Science Olympiad.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2fHx8ZW58MHx8fHx8",
    achievement: "National Winner",
    icon: Target,
    gradient: "from-info to-blue-600",
    sparkleColor: "text-accent"
  },
];

// Sparkle component
const Sparkle = ({ color, delay, size = "w-2 h-2" }) => (
  <motion.div
    className={`absolute ${size} ${color} opacity-0`}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 1.5,
      delay,
      repeat: Infinity,
      repeatDelay: 2,
    }}
  >
    <Sparkles className="w-full h-full" />
  </motion.div>
);

const SuccessStoriesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    // Show sparkles when component mounts
    setShowSparkles(true);
    
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % successStories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + successStories.length) % successStories.length);
  };

  const currentStory = successStories[currentIndex];
  const IconComponent = currentStory.icon;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary-light to-background overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-primary-light rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Sparkles Effect */}
      {showSparkles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <Sparkle
              key={i}
              color={currentStory.sparkleColor}
              delay={i * 0.1}
              size={i % 3 === 0 ? "w-3 h-3" : "w-2 h-2"}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="inline-block mb-4"
          >
            <div className="text-6xl md:text-8xl">🏆</div>
          </motion.div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-text mb-4">
            Success Stories
          </h1>
          <p className="text-lg md:text-xl text-text/80 max-w-2xl mx-auto px-4">
            Discover how our students achieved their dreams through dedication and our guidance
          </p>
        </motion.div>

        {/* Main Carousel */}
        <div className="relative w-full max-w-4xl lg:max-w-6xl mx-auto px-4">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.3 },
                rotateY: { duration: 0.3 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                } else if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                }
              }}
              className="cursor-grab active:cursor-grabbing"
            >
              <div className="relative">
                {/* Achievement Badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className={`absolute -top-4 -right-4 md:-top-6 md:-right-6 z-20 p-3 md:p-4 rounded-full bg-gradient-to-r ${currentStory.gradient} shadow-2xl`}
                >
                  <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </motion.div>

                {/* Main Card */}
                <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-card hover:shadow-hover transition-all duration-300 border border-primary/20">
                  <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
                    {/* Image Section */}
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative order-2 md:order-1"
                    >
                      <div className="relative overflow-hidden rounded-xl md:rounded-2xl">
                        <img
                          src={currentStory.image}
                          alt={currentStory.title}
                          className="w-full h-64 md:h-80 object-cover transform hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                      
                      {/* Achievement Text */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={`absolute bottom-3 left-3 md:bottom-4 md:left-4 px-3 py-1 md:px-4 md:py-2 rounded-full bg-gradient-to-r ${currentStory.gradient} text-white font-bold text-sm md:text-lg shadow-lg`}
                      >
                        {currentStory.achievement}
                      </motion.div>
                    </motion.div>

                    {/* Content Section */}
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-text order-1 md:order-2"
                    >
                      <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 text-text">
                        {currentStory.title}
                      </h2>
                      <p className="text-base md:text-xl text-text/80 leading-relaxed mb-4 md:mb-6">
                        {currentStory.description}
                      </p>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <div className="bg-primary/10 rounded-xl p-3 md:p-4 text-center border border-primary/20">
                          <div className="text-xl md:text-2xl font-bold text-primary">100%</div>
                          <div className="text-text/70 text-sm md:text-base">Success Rate</div>
                        </div>
                        <div className="bg-accent/10 rounded-xl p-3 md:p-4 text-center border border-accent/20">
                          <div className="text-xl md:text-2xl font-bold text-accent-dark">500+</div>
                          <div className="text-text/70 text-sm md:text-base">Students</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => paginate(-1)}
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 md:p-3 text-primary hover:bg-primary hover:text-white transition-colors shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => paginate(1)}
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 md:p-3 text-primary hover:bg-primary hover:text-white transition-colors shadow-lg"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        </div>

        {/* Dots Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex space-x-2 md:space-x-3 mt-6 md:mt-8"
        >
          {successStories.map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-primary/30'
              }`}
            />
          ))}
        </motion.div>

        {/* Scroll indicator for mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="md:hidden text-center mt-4"
        >
          <p className="text-sm text-text/60">Swipe to see more stories</p>
        </motion.div>
      </div>

      {/* CSS for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default SuccessStoriesCarousel;