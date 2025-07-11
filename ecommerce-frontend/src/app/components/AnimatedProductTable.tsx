import * as React from 'react';
import { motion } from 'framer-motion';

// Dummy data for now
type Product = {
  name: string;
  price: number;
  category: string;
};

const products: Product[] = [
  { name: 'Headphones', price: 99, category: 'Electronics' },
  { name: 'Smartwatch', price: 149, category: 'Electronics' },
  { name: 'Sneakers', price: 89, category: 'Fashion' },
  { name: 'Water Bottle', price: 19, category: 'Home' },
  { name: 'Backpack', price: 59, category: 'Accessories' },
];

const cardAngles = [-15, -7, 0, 7, 15];
const cardOffsets = [-120, -60, 0, 60, 120];

export default function AnimatedProductTable() {
  const [hovered, setHovered] = React.useState<number | null>(null);

  return (
    <section className="relative py-24 bg-black min-h-[500px] flex flex-col items-center justify-center overflow-x-auto">
      {/* Brand overlay */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none">
        <span className="text-[5rem] md:text-[7rem] font-serif font-extrabold tracking-tight text-white/90 leading-none drop-shadow-xl" style={{letterSpacing: '-0.04em'}}>Alinma</span>
      </div>
      {/* Card deck */}
      <div className="relative flex justify-center items-end w-full max-w-5xl h-[380px] mt-24">
        {products.map((product, i) => {
          const isHovered = hovered === i;
          const isAnyHovered = hovered !== null;
          const z = isHovered ? 100 : i;
          const angle = cardAngles[i] || 0;
          const offset = cardOffsets[i] || 0;
          return (
            <motion.div
              key={product.name}
              className="absolute left-1/2 bottom-0 w-64 h-80"
              style={{
                zIndex: z,
                transform: `translateX(-50%) translateX(${offset}px) rotateY(${angle}deg)`,
                perspective: '1200px',
                pointerEvents: isAnyHovered && !isHovered ? 'none' : 'auto',
              }}
              initial={{ y: 40, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{
                y: -48,
                scale: 1.08,
                rotateY: 0,
                boxShadow: '0 0 0 2px #fff, 0 8px 40px 0 rgba(255,255,255,0.10)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(200,200,200,0.08) 100%)',
                zIndex: 200,
                filter: 'none',
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className={`w-full h-full flex flex-col items-center justify-between p-8 transition-all duration-300 ${
                  isHovered
                    ? 'bg-gradient-to-br from-white/20 to-white/5 border border-white/30 shadow-2xl rounded-xl backdrop-blur-[2px]'
                    : 'bg-gradient-to-br from-white/10 to-white/0 border border-transparent shadow-none rounded-xl backdrop-blur-[1.5px]'
                }`}
                style={{
                  borderRadius: '18px',
                  boxShadow: isHovered
                    ? '0 0 0 2px #fff, 0 16px 64px 0 rgba(255,255,255,0.12)'
                    : '0 2px 24px 0 rgba(255,255,255,0.04)',
                  background: isHovered
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(200,200,200,0.10) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(200,200,200,0.02) 100%)',
                  opacity: isAnyHovered && !isHovered ? 0.15 : 1,
                  filter: isAnyHovered && !isHovered ? 'blur(2.5px)' : 'none',
                  transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
                }}
              >
                {(!isAnyHovered || isHovered) && (
                  <>
                    <div className="text-xl font-semibold text-white/90 mb-2 tracking-tight">{product.name}</div>
                    <div className="text-base text-gray-300 mb-4">{product.category}</div>
                    <div className="text-3xl font-extrabold text-white mb-6">${product.price}</div>
                    <button className="w-full py-2 rounded bg-white/10 text-white font-bold border border-white/20 hover:bg-white/20 transition">View Product</button>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
} 