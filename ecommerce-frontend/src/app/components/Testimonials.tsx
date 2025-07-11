import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Alice Smith',
    text: 'Absolutely love this store! The products are top-notch and the service is amazing. Highly recommend to everyone.',
    avatar: '/public/globe.svg',
  },
  {
    name: 'John Doe',
    text: 'A seamless shopping experience from start to finish. The animations and design are so cool!',
    avatar: '/public/window.svg',
  },
  {
    name: 'Priya Patel',
    text: 'I keep coming back for more. The site is beautiful and the products are even better in person.',
    avatar: '/public/next.svg',
  },
];

export default function Testimonials() {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-primary">What Our Customers Say</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">Real reviews from real shoppers. We’re proud to have a community that loves us back.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-center max-w-5xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
            className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full text-center"
          >
            <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-accent" />
            <p className="text-lg text-gray-700 mb-4">“{t.text}”</p>
            <div className="font-bold text-primary">{t.name}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
} 