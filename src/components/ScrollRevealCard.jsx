import { motion } from "framer-motion";

const CarouselCard = ({ title, description, image }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col md:flex-row items-center bg-white rounded-3xl shadow-lg overflow-hidden hover:scale-[1.02] transition-all duration-500 max-w-4xl mx-auto"
    >
      <div className="w-full md:w-1/2 h-64 md:h-80 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </motion.div>
  );
};

export default CarouselCard;
