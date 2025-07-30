'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import Image from 'next/image';

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  photo: string;
  date: string;
  verified: boolean;
}

const reviews: Review[] = [
  {
    id: '1',
    name: 'Marie-Claire Nzengue',
    location: 'Libreville, Gabon',
    rating: 5,
    comment: 'Excellent service ! Les cocktails sont délicieux et la livraison très rapide. Je recommande vivement Akanda Apéro pour vos soirées entre amis.',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    date: '15 janvier 2024',
    verified: true
  },
  {
    id: '2',
    name: 'Jean-Baptiste Mba',
    location: 'Port-Gentil, Gabon',
    rating: 5,
    comment: 'Les kits cocktails sont parfaits pour nos événements d\'entreprise. Qualité irréprochable et présentation soignée. Bravo à toute l\'équipe !',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    date: '8 janvier 2024',
    verified: true
  },
  {
    id: '3',
    name: 'Laeticia Koumba',
    location: 'Franceville, Gabon',
    rating: 5,
    comment: 'J\'ai commandé pour l\'anniversaire de ma fille. Les invités ont adoré ! Les mocktails sans alcool sont aussi savoureux que les cocktails classiques.',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    date: '2 janvier 2024',
    verified: true
  },
  {
    id: '4',
    name: 'Patrick Obame',
    location: 'Oyem, Gabon',
    rating: 5,
    comment: 'Service client exceptionnel ! Ils ont su s\'adapter à mes demandes spécifiques pour mon mariage. Les cocktails étaient un vrai succès.',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    date: '28 décembre 2023',
    verified: true
  },
  {
    id: '5',
    name: 'Sylvie Mintsa',
    location: 'Lambaréné, Gabon',
    rating: 5,
    comment: 'Les ingrédients sont frais et de qualité. J\'apprécie particulièrement la variété des options disponibles. Akanda Apéro est devenu mon choix n°1 !',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    date: '20 décembre 2023',
    verified: true
  },
  {
    id: '6',
    name: 'Emmanuel Ndong',
    location: 'Mouila, Gabon',
    rating: 5,
    comment: 'Parfait pour nos réunions familiales ! La livraison est ponctuelle et les cocktails arrivent bien présentés. Merci pour ce service de qualité.',
    photo: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    date: '15 décembre 2023',
    verified: true
  }
];

const CustomerReviews: React.FC = () => {
  const [currentReview, setCurrentReview] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-scroll des avis
  useEffect(() => {
    if (!isAutoPlaying || reviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length);
    setIsAutoPlaying(false);
  };

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
    setIsAutoPlaying(false);
  };

  const goToReview = (index: number) => {
    setCurrentReview(index);
    setIsAutoPlaying(false);
  };

  if (reviews.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ce que disent nos clients
          </motion.h2>
          <motion.p 
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Découvrez les témoignages authentiques de nos clients satisfaits à travers tout le Gabon
          </motion.p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Review Card */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentReview}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="p-6 sm:p-8 md:p-12"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Quote Icon */}
                  <div className="mb-4 sm:mb-6">
                    <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
                  </div>

                  {/* Review Text */}
                  <blockquote className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-6 sm:mb-8 max-w-3xl">
                    "{reviews[currentReview].comment}"
                  </blockquote>

                  {/* Customer Info */}
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    {/* Photo */}
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-4 ring-orange-100">
                        <Image
                          src={reviews[currentReview].photo}
                          alt={reviews[currentReview].name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {reviews[currentReview].verified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="text-center sm:text-left">
                      <h4 className="font-semibold text-gray-900 text-lg sm:text-xl">
                        {reviews[currentReview].name}
                      </h4>
                      <p className="text-gray-600 text-sm sm:text-base mb-2">
                        {reviews[currentReview].location}
                      </p>
                      
                      {/* Stars */}
                      <div className="flex justify-center sm:justify-start items-center space-x-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < reviews[currentReview].rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-500">
                        {reviews[currentReview].date}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevReview}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white shadow-lg hover:shadow-xl rounded-full flex items-center justify-center text-gray-600 hover:text-orange-500 transition-all duration-200 z-10"
            aria-label="Avis précédent"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </button>

          <button
            onClick={nextReview}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white shadow-lg hover:shadow-xl rounded-full flex items-center justify-center text-gray-600 hover:text-orange-500 transition-all duration-200 z-10"
            aria-label="Avis suivant"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToReview(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentReview
                  ? 'bg-orange-500 w-6 sm:w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Aller à l'avis ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats */}
        <motion.div 
          className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="text-center p-4 bg-white rounded-xl shadow-sm">
            <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">500+</div>
            <div className="text-xs sm:text-sm text-gray-600">Clients satisfaits</div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-sm">
            <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">4.9</div>
            <div className="text-xs sm:text-sm text-gray-600">Note moyenne</div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-sm">
            <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">98%</div>
            <div className="text-xs sm:text-sm text-gray-600">Recommandent</div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-sm">
            <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">24h</div>
            <div className="text-xs sm:text-sm text-gray-600">Livraison rapide</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CustomerReviews;
