import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const OverlappingCards = ({ cards }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  });

  const totalHeight = `${cards.length * 100}vh`; // e.g. 4 cards = 400vh

  return (
    <div ref={ref} className="relative" style={{ height: totalHeight }}>
      <div className="sticky top-20 h-screen flex items-center justify-center">
        {cards.map((card, i) => {
          const start = i * 0.25;
          const end = start + 0.25;
          const y = useTransform(scrollYProgress, [start, end], [200, 0]);

          return (
            <motion.div
              key={card.id}
              style={{ y, zIndex: cards.length - i }}
              className="absolute w-full max-w-3xl mx-auto px-4"
            >
              {/* Card content */}
              <div className={`rounded-2xl p-6 md:p-8 shadow-2xl text-white ${card.color}`}>
                {/* content as before */}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};


export default OverlappingCards;
