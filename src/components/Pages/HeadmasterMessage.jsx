import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

// Mock Layout component for demonstration
const Layout = ({ title, subtitle, children }) => (
  <div className="min-h-screen bg-background">
    <div className="pt-16 pb-16">
      <div className="text-center mb-16">
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-text mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {title}
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
      </div>
      {children}
    </div>
  </div>
);

const HeadmasterMessage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Parallax transforms
  const headerY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.4
      }
    }
  };

  const itemVariants = {
    hidden: { y: 80, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20,
        duration: 0.8
      }
    }
  };

  const letterVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: { delay: i * 0.03, type: "spring", stiffness: 120 }
    })
  };

  const FloatingElement = ({ children, delay = 0 }) => (
    <motion.div
      animate={{
        y: [0, -15, 0],
        rotate: [0, 2, -2, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );

  return (
    <Layout
      title="Headmaster's Message"
      subtitle="A word from our visionary leader"
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-24 h-24 md:w-32 md:h-32 bg-primary/5 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 right-20 w-16 h-16 md:w-24 md:h-24 bg-accent/5 rounded-full"
          animate={{
            scale: [1, 0.7, 1],
            x: [0, 40, 0]
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 right-10 w-12 h-12 md:w-16 md:h-16 bg-primary-light/5 rounded-full"
          animate={{
            y: [0, -60, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Enhanced Profile Card */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary-light/5 to-accent/5 rounded-2xl transform rotate-1 scale-105"></div>
          
          <div className="relative bg-white border border-gray-100 rounded-2xl shadow-card hover:shadow-hover transition-all duration-500 p-6 md:p-10 lg:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              
              {/* Enhanced Profile Image */}
              <motion.div
                className="relative group flex-shrink-0"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Gradient ring */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-accent rounded-full p-1 group-hover:p-2 transition-all duration-500">
                  <div className="w-full h-full bg-white rounded-full"></div>
                </div>
                
                <motion.div
                  className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 overflow-hidden rounded-full shadow-hover group-hover:shadow-xl transition-all duration-500"
                  whileHover={{ 
                    boxShadow: "0 25px 50px -12px rgba(0, 121, 107, 0.25)"
                  }}
                >
                  <motion.img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZmFjZXxlbnwwfHwwfHx8MA%3D%3D"
                    alt="Headmaster Dr. Matthew Raggett"
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
                
                {/* Floating badge */}
                <FloatingElement delay={1.2}>
                  <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-primary to-primary-dark text-white px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold shadow-card border-2 border-white">
                    ✨ Visionary Leader
                  </div>
                </FloatingElement>
              </motion.div>

              {/* Enhanced Profile Content */}
              <div className="text-center lg:text-left max-w-3xl space-y-6 flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 1 }}
                >
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
                    {"Dr. Matthew Raggett".split("").map((letter, i) => (
                      <motion.span
                        key={i}
                        variants={letterVariants}
                        custom={i}
                        className="inline-block hover:text-primary-dark transition-colors duration-300"
                      >
                        {letter === " " ? "\u00A0" : letter}
                      </motion.span>
                    ))}
                  </h2>
                  
                  <motion.div
                    className="flex items-center justify-center lg:justify-start gap-3 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse-slow"></div>
                    <p className="text-lg md:text-xl font-semibold text-text">
                      Headmaster, The EduReach
                    </p>
                    <div className="w-2 h-2 bg-primary-light rounded-full animate-pulse-slow"></div>
                  </motion.div>
                </motion.div>

                <motion.p
                  className="text-gray-600 text-base md:text-lg leading-relaxed bg-gradient-to-r from-background to-gray-50 rounded-xl p-6 border-l-4 border-primary shadow-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  With over two decades of educational leadership, Dr. Raggett blends
                  tradition with innovation to shape tomorrow's leaders through a
                  world-class academic and character-building experience.
                </motion.p>

                {/* Achievement badges */}
                <motion.div
                  className="flex flex-wrap gap-3 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  {[
                    { text: "20+ Years", color: "from-primary to-primary-dark" },
                    { text: "Educational Innovation", color: "from-accent to-accent-dark" },
                    { text: "Character Building", color: "from-primary-light to-primary" }
                  ].map(({ text, color }, i) => (
                    <motion.span
                      key={text}
                      className={`px-4 py-2 bg-gradient-to-r ${color} text-white rounded-full text-sm font-medium shadow-card hover:shadow-hover cursor-pointer`}
                      whileHover={{ 
                        scale: 1.05, 
                        boxShadow: "0 8px 25px rgba(0, 121, 107, 0.3)" 
                      }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.4 + i * 0.1 }}
                    >
                      {text}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Message Content */}
        <motion.div
          variants={itemVariants}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-primary-light/3 to-accent/3 rounded-2xl blur-3xl opacity-50 transform scale-110"></div>
          <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-card hover:shadow-hover transition-all duration-500 p-6 md:p-10 lg:p-12 border border-gray-100 overflow-hidden">
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full transform translate-x-12 -translate-y-12"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 bg-gradient-to-tr from-accent/5 to-primary-light/5 rounded-full transform -translate-x-8 translate-y-8"></div>
            
            <div className="relative prose prose-lg max-w-none">
              <motion.div
                className="space-y-8 text-text text-base md:text-lg leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
              >
                {[
                  "Dear Parents, Students, and Friends of The EduReach,",
                  "It is my great privilege to welcome you to The EduReach, an institution that has been shaping young minds and building character for nearly nine decades.",
                  "At Doon, we believe that education extends beyond the classroom. Our holistic approach integrates academic rigor with emotional intelligence, leadership, and service.",
                  "Our faculty are more than educators — they are mentors and role models who ignite curiosity, build character, and help students uncover their true potential.",
                  "Integrity, resilience, compassion, and excellence are the cornerstones we instill in our students — shaping not just scholars, but responsible global citizens.",
                  "As we embrace the future, we remain rooted in our values while continuously evolving to meet the demands of a dynamic world.",
                  "I invite you to explore our vibrant learning ecosystem and become part of our ever-growing community."
                ].map((paragraph, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: i * 0.15, duration: 0.8 }}
                    className="hover:text-primary transition-colors duration-300 cursor-default"
                  >
                    {paragraph}
                  </motion.p>
                ))}

                <motion.div
                  className="pt-8 border-t border-gray-200 mt-12"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
                  <p className="mb-0">
                    Warm regards,<br />
                    <strong className="text-xl md:text-2xl text-primary font-bold">
                      Dr. Matthew Raggett
                    </strong><br />
                    <em className="text-gray-600 text-base">Headmaster, The EduReach</em>
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Quote Section */}
        <motion.div
          variants={itemVariants}
          className="relative group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary-light rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          
          <div className="relative bg-gradient-to-br from-primary via-primary-dark to-primary-light text-white rounded-2xl shadow-hover p-6 md:p-10 lg:p-12 overflow-hidden">
            
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(25)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 md:w-2 md:h-2 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 4,
                    delay: i * 0.15,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>

            <div className="relative text-center space-y-8">
              <motion.div
                className="text-4xl md:text-6xl lg:text-8xl opacity-20 mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 2, type: "spring", stiffness: 100 }}
              >
                "
              </motion.div>

              <motion.blockquote
                className="text-lg md:text-xl lg:text-2xl xl:text-3xl italic font-light leading-relaxed max-w-5xl mx-auto"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 1.2 }}
              >
                Education is not preparation for life; education is life itself. At Doon, we don't just prepare 
                students for the future — we empower them to lead it.
              </motion.blockquote>

              <motion.cite
                className="block text-accent-light font-semibold text-base md:text-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                — Dr. Matthew Raggett
              </motion.cite>

              {/* Decorative line */}
              <motion.div
                className="w-16 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: "6rem" }}
                viewport={{ once: true }}
                transition={{ delay: 1.3, duration: 1.2 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Enhanced Call to Action */}
        <motion.div
          variants={itemVariants}
          className="text-center space-y-8"
        >
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <motion.button
              className="group relative px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-full shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden min-w-[200px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Explore Our Community</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-accent to-accent-dark"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.4 }}
              />
            </motion.button>

            <motion.button
              className="group relative px-8 py-4 bg-white border-2 border-primary text-primary font-semibold rounded-full shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden min-w-[200px]"
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "#00796B",
                color: "#ffffff"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Learn More</span>
            </motion.button>
          </motion.div>

          {/* Contact info */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center text-gray-600 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>admissions@doonschool.com</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>+91 135 267 2000</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default HeadmasterMessage;