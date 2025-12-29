import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import { GALLERY_IMAGES } from '@/utils/landingData';

const GallerySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      <section ref={ref} className="relative bg-black text-white py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-6 md:px-16">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="mb-16 md:mb-20 text-center"
          >
            <p className="text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-emerald-400 mb-4">
              Gallery
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase leading-tight">
              Momen{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
                Terbaik
              </span>
            </h2>
          </motion.div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {GALLERY_IMAGES.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative group cursor-pointer overflow-hidden rounded-2xl ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
                onClick={() => setSelectedImage(image)}
              >
                <div className={`aspect-square ${index === 0 ? 'md:aspect-auto md:h-full' : ''}`}>
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover: scale-110"
                    onError={(e) => {
                      e.target.src = `https://images.unsplash. com/photo-1574629810360-7efbbe195018?w=800&q=80`;
                    }}
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-sm font-medium text-white">{image.alt}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={selectedImage.url}
            alt={selectedImage.alt}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {selectedImage.alt}
          </p>
        </motion.div>
      )}
    </>
  );
};

export default GallerySection;
