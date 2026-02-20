import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const stories = [
  {
    id: 1,
    title: "Web Development",
    description: "Build fast, sleek websites that impress every visitor.",
    image: "hhttps://media.istockphoto.com/id/1072477354/photo/indian-high-school-students-stock-image.jpg?s=1024x1024&w=is&k=20&c=RJvh3zuEI3f7_yRG2--lamk3il8BNBucvreYFy21kHs=",
  },
  {
    id: 2,
    title: "Product Photography",
    description:
      "Capture your products beautifully to inspire instant desire.",
    image: "https://media.istockphoto.com/id/1072477354/photo/indian-high-school-students-stock-image.jpg?s=1024x1024&w=is&k=20&c=RJvh3zuEI3f7_yRG2--lamk3il8BNBucvreYFy21kHs=",
  },
  {
    id: 3,
    title: "Creative Branding",
    description: "Tell stories through stunning visuals and identity.",
    image: "https://media.istockphoto.com/id/1072477354/photo/indian-high-school-students-stock-image.jpg?s=1024x1024&w=is&k=20&c=RJvh3zuEI3f7_yRG2--lamk3il8BNBucvreYFy21kHs=",
  },
];

export default function SuccessStories() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={containerRef}
      className="relative h-[300vh] bg-background font-sans"
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {stories.map((story, index) => {
          const y = useTransform(
            scrollYProgress,
            [0, 1],
            [100 * (stories.length - index), 0]
          );

          return (
            <motion.div
              key={story.id}
              style={{ y, zIndex: index }}
              className="absolute w-[90%] max-w-5xl h-[80%] bg-white text-text shadow-hover rounded-2xl flex flex-col md:flex-row overflow-hidden transition-all duration-500"
            >
              {/* Left Image */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right Content */}
              <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-dark">
                  {story.title}
                </h2>
                <p className="text-gray-700 text-base">{story.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
