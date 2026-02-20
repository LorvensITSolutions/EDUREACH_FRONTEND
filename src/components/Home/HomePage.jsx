import React, { useState, useEffect } from 'react';
import { Users, Award, BookOpen, Calendar, ArrowRight, Star, Trophy, Target, Heart, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import school_images from "../../assets/students_1.jpg";
import school_3 from "../../assets/school_3.jpg";
import school_4 from "../../assets/school_4.jpg";
import school_5 from "../../assets/school_5.jpg";
import graduated from "../../assets/graduated.jpg";
import SuccessStoriesCarousel from "../SuccessStoriesCarousel";
import SchoolGallery from '../Pages/SchoolGalleryPage';


const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const heroSlides = [
    {
      image: school_5,
      title: 'Excellence in Education',
      subtitle: 'Nurturing Tomorrow\'s Leaders with a Future-Ready Curriculum.',
      cta: 'Discover Our Programs'
    },
    {
      image: school_images,
      title: 'Innovation & Dynamic Learning',
      subtitle: 'Where Curiosity Thrives and Dreams Take Flight through Interactive Sessions.',
      cta: 'Join Our Community'
    },
    {
      image:school_3,
      title: 'Academic Achievement & Growth',
      subtitle: 'Empowering Students to Build Bright Futures with Strong Foundations.',
      cta: 'Apply Today'
    },
    {
      image:school_4,
      title: 'Holistic Development',
      subtitle: 'Fostering Mind, Body, and Spirit for Well-Rounded Individuals.',
      cta: 'Explore Campus'
    }
  ];

  const features = [
    {
      icon: Users,
      title: 'Expert Faculty',
      description: 'World-class educators with decades of experience dedicated to student success.',
      gradient: 'from-primary-light to-primary-dark'
    },
    {
      icon: Award,
      title: 'Academic Excellence',
      description: 'Consistent top performance and recognition in national and international arenas.',
      gradient: 'from-accent-light to-accent-dark'
    },
    {
      icon: BookOpen,
      title: 'Modern Curriculum',
      description: 'Cutting-edge programs aligned with global standards and future industry needs.',
      gradient: 'from-info to-blue-800' // Using an info color, can adjust if a specific green is needed
    },
    {
      icon: Calendar,
      title: 'Rich Activities',
      description: 'Comprehensive co-curricular programs fostering creativity, sports, and leadership.',
      gradient: 'from-purple-400 to-purple-600' // Using a different gradient for variety
    }
  ];

  const stats = [
    { number: '1,500+', label: 'Happy Students', icon: Users, color: 'text-primary' },
    { number: '75+', label: 'Expert Teachers', icon: Award, color: 'text-accent-dark' },
    { number: '98%', label: 'Success Rate', icon: Trophy, color: 'text-success' },
    { number: '30+', label: 'Years Excellence', icon: Star, color: 'text-danger' }
  ];

  const successStories = [
    {
      name: 'Sarah Johnson',
      achievement: 'Harvard Medical School',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      quote: 'EduReach shaped my dreams into reality and provided unparalleled support.'
    },
    {
      name: 'Michael Chen',
      achievement: 'MIT Engineering',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      quote: 'The foundation I received at EduReach was instrumental for my success at MIT.'
    },
    {
      name: 'Emma Rodriguez',
      achievement: 'Stanford Business',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?q=80&w=300&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      quote: 'EduReach instilled in me the drive for excellence that led me to Stanford.'
    }
  ];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="min-h-screen font-sans overflow-x-hidden bg-background text-text">
      {/* Hero Carousel Section */}
      <section className="relative h-[70vh] sm:h-[80vh] md:h-screen overflow-hidden">
        {/* Background Images */}
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </div>
        ))}

        {/* Navigation Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 touch-manipulation"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 touch-manipulation"
          aria-label="Next slide"
        >
          <ChevronRight size={20} className="sm:w-6 sm:h-6" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute top-2 sm:top-4 md:top-8 right-2 sm:right-4 md:right-8 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300 touch-manipulation"
          aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isPlaying ? <Pause size={18} className="sm:w-5 sm:h-5" /> : <Play size={18} className="sm:w-5 sm:h-5" />}
        </button>

        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-4xl">
              <div key={currentSlide}>
                {/* School Name with Dramatic Effect */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-light to-primary mb-2 sm:mb-4 leading-none">
                    EDU
                  </h1>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-light via-accent to-accent-dark leading-none">
                    REACH
                  </h1>
                </div>

                {/* Dynamic Content */}
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-4 animate-fade-in">
                  {heroSlides[currentSlide].title}
                </h2>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-200 mb-4 sm:mb-6 md:mb-8 max-w-2xl animate-slide-up">
                  {heroSlides[currentSlide].subtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-bounce-in">
                  <a
                    href="#admissions"
                    className="group bg-gradient-to-r from-accent to-accent-dark hover:from-accent-dark hover:to-accent text-text px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center justify-center space-x-2"
                  >
                    <span className="whitespace-nowrap">{heroSlides[currentSlide].cta}</span>
                    <ArrowRight size={18} className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="#portal"
                    className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/30 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center space-x-2"
                  >
                    <span className="whitespace-nowrap">Student Portal</span>
                    <ArrowRight size={18} className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2 sm:space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 sm:h-3 rounded-full transition-all duration-300 touch-manipulation ${
                index === currentSlide
                  ? 'bg-accent w-6 sm:w-8'
                  : 'bg-white/50 hover:bg-white/70 w-2 sm:w-3'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary-light/10 via-transparent to-accent-light/10 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-text via-primary-dark to-primary mb-2 sm:mb-4">
              Our Impact
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Numbers that speak for our unwavering commitment to excellence and student success.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group text-center transform hover:scale-105 transition-all duration-300"
              >
                <div className="relative mb-3 sm:mb-4 md:mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-white to-gray-100 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <stat.icon className={`${stat.color} group-hover:scale-125 transition-transform duration-300 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8`} />
                  </div>
                </div>
                <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black ${stat.color} mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 font-semibold text-xs sm:text-sm md:text-base lg:text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*<SuccessStoriesCarousel />*/}
   

      {/* Enhanced Features Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-primary-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 md:mb-6">
              Why Choose
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-accent-dark">
                EduReach?
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              Experience education that goes beyond textbooks and truly transforms lives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-7 md:p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r ${feature.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                    <feature.icon className="text-white w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 md:mb-4 group-hover:text-accent-light transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced About Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-bl from-primary-light/30 to-transparent rounded-full -translate-y-24 sm:-translate-y-32 md:-translate-y-48 translate-x-24 sm:translate-x-32 md:translate-x-48" />
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-tr from-accent-light/30 to-transparent rounded-full translate-y-24 sm:translate-y-32 md:translate-y-48 -translate-x-24 sm:-translate-x-32 md:-translate-x-48" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-text via-primary-dark to-primary mb-4 sm:mb-6 md:mb-8 leading-tight">
                Building Tomorrow's
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-dark">
                  Leaders Today
                </span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-8 leading-relaxed">
                At EduReach, we don't just educate—we inspire, innovate, and ignite a lifelong passion for learning. 
                Our holistic approach nurtures every aspect of your child's development, ensuring they are ready for the future.
              </p>
              
              <div className="space-y-4 sm:space-y-5 md:space-y-6 mb-6 sm:mb-8 md:mb-10">
                {[
                  { icon: Target, text: 'Personalized learning pathways tailored to each student', color: 'text-primary' },
                  { icon: Heart, text: 'Nurturing and inclusive environment where every student thrives', color: 'text-info' },
                  { icon: Trophy, text: 'Excellence in academics and beyond, fostering all-round success', color: 'text-accent-dark' }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start sm:items-center space-x-3 sm:space-x-4 group"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-white to-gray-100 rounded-lg sm:rounded-xl shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <item.icon className={`${item.color} w-5 h-5 sm:w-6 sm:h-6`} />
                    </div>
                    <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>

              <a
                href="#admissions"
                className="group bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center space-x-2 sm:space-x-3"
              >
                <span>Start Your Journey</span>
                <ArrowRight size={20} className="sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="relative">
                <img
                  src={graduated}
                  alt="Students learning at EduReach"
                  className="rounded-2xl sm:rounded-3xl shadow-2xl w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl sm:rounded-3xl" />
                
                {/* Floating Achievement Badge */}
                <div className="absolute -bottom-4 sm:-bottom-6 md:-bottom-8 -right-4 sm:-right-6 md:-right-8 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-r from-accent to-accent-dark rounded-full flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl font-black text-white">30+</div>
                    <div className="text-xs sm:text-sm font-bold text-white">Years</div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-3 sm:-top-4 md:-top-6 -left-3 sm:-left-4 md:-left-6 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-primary-light rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                  <BookOpen className="text-white w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
                <div className="absolute top-1/2 -right-2 sm:-right-3 md:-right-4 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-info rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                  <Star className="text-white w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-primary-dark relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 md:mb-6">
              Alumni
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-accent-dark">
                Success Stories
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              Our graduates are thriving and making significant contributions across the globe.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {successStories.map((story, index) => (
              <div
                key={index}
                className="group bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-7 md:p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="text-center">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 rounded-full mx-auto mb-4 sm:mb-5 md:mb-6 object-cover border-2 sm:border-4 border-accent group-hover:scale-110 transition-transform duration-300"
                  />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">{story.name}</h3>
                  <p className="text-sm sm:text-base text-accent-light font-semibold mb-3 sm:mb-4">{story.achievement}</p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-300 italic leading-relaxed">"{story.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* School Gallery Section */}
      <SchoolGallery/>

      {/* Enhanced CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 50L60 40L70 50L60 60z M20 20L30 10L40 20L30 30z M80 80L90 70L100 80L90 90z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 md:mb-8">
              Ready to Join the
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-accent-dark">
                EduReach Family?
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-100 mb-6 sm:mb-8 md:mb-10 lg:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Take the first step towards an extraordinary educational journey. Your future starts here with us.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6 justify-center">
              <a
                href="#admissions"
                className="group bg-gradient-to-r from-accent to-accent-dark hover:from-accent-dark hover:to-accent text-text px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center justify-center space-x-2 sm:space-x-3"
              >
                <span className="whitespace-nowrap">Apply Now</span>
                <ArrowRight size={20} className="sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#events"
                className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/30 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center space-x-2 sm:space-x-3"
              >
                <span className="whitespace-nowrap">Schedule Visit</span>
                <Calendar size={20} className="sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Re-using and ensuring animations from original code apply */
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-in {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out 0.2s forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.4s forwards;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out 0.6s forwards;
        }
      `}</style>
    </div>
  );
};

export default HomePage;