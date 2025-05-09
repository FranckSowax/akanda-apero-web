"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import styles from '../../app/landing.module.css';

export interface HeroSlideProps {
  id: number;
  backgroundUrl: string; // URL pour l'image d'arrière-plan
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  buttonAction?: () => void;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  secondaryButtonAction?: () => void;
  statValue?: string;
  statLabel?: string;
  textColor?: string; // Couleur du texte pour assurer la lisibilité sur l'image de fond
}

interface HeroSliderProps {
  slides: HeroSlideProps[];
  autoplay?: boolean;
  autoplaySpeed?: number;
}

export const HeroSlider = ({
  slides,
  autoplay = true,
  autoplaySpeed = 5000,
}: HeroSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoplay);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    // Reset autoplay timer when manually changing slides
    if (autoplay) {
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 100);
    }
  };

  // Handle autoplay
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoPlaying) {
      interval = setInterval(() => {
        nextSlide();
      }, autoplaySpeed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying, autoplaySpeed, nextSlide]);

  // Pause autoplay on hover
  const pauseAutoplay = () => setIsAutoPlaying(false);
  const resumeAutoplay = () => setIsAutoPlaying(autoplay);

  return (
    <div 
      className="relative overflow-hidden"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div 
            key={slide.id} 
            className="min-w-full relative h-[400px] sm:h-[500px] md:h-[600px]" 
          >
            <Image
              src={slide.backgroundUrl}
              alt={slide.title}
              fill
              priority
              className="object-cover object-center"
            />
            {/* Overlay pour assurer la lisibilité du texte */}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <div className="flex flex-col md:flex-row items-center py-8 sm:py-12 md:py-16 h-full">
                <div className="w-full md:w-2/3 pr-0 md:pr-8">
                  <h1 className={cn(styles.largeHeading, "text-2xl sm:text-3xl md:text-4xl lg:text-5xl", slide.textColor || "text-white")}>
                    {slide.title} <span className={styles.accentText}>{slide.subtitle}</span>
                  </h1>
                  <p className={cn("mb-4 sm:mb-6 text-sm sm:text-base md:text-lg max-w-xl", slide.textColor || "text-white")}>
                    {slide.description}
                  </p>
                  <div className="flex flex-wrap gap-3 sm:space-x-4">
                    <Link href={slide.buttonLink} className="w-full sm:w-auto">
                      <Button 
                        className="rounded-full px-4 sm:px-6 py-2 sm:py-3 bg-[#f5a623] hover:bg-[#e09000] text-white text-sm sm:text-base w-full sm:w-auto"
                        onClick={slide.buttonAction}
                      >
                        {slide.buttonText}
                      </Button>
                    </Link>
                    {slide.secondaryButtonText && (
                      <Link href={slide.secondaryButtonLink || "#"} className="w-full sm:w-auto">
                        <Button 
                          variant="outline" 
                          className="rounded-full px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base w-full sm:w-auto mt-2 sm:mt-0"
                          onClick={slide.secondaryButtonAction}
                        >
                          {slide.secondaryButtonText}
                        </Button>
                      </Link>
                    )}
                  </div>
                  
                  {slide.statValue && (
                    <div className="mt-6 sm:mt-8 md:mt-12 flex items-center">
                      <div>
                        <div className={cn(styles.stat, "text-white text-2xl sm:text-3xl md:text-4xl")}>{slide.statValue}</div>
                        <p className="text-xs sm:text-sm text-white">{slide.statLabel}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-4 sm:top-8 md:top-12 right-4 sm:right-8 md:right-12 bg-white rounded-full p-2 sm:p-3 shadow-md z-10">
                    <div className="text-xs sm:text-sm font-bold text-[#f5a623]">Livraison</div>
                    <div className="text-lg sm:text-xl md:text-2xl text-gray-700">&lt; 60 min</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button 
        className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 bg-white/80 p-1 sm:p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-700" />
      </button>
      
      <button 
        className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 bg-white/80 p-1 sm:p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-700" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-0 right-0 flex justify-center gap-1 sm:gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors",
              currentSlide === index ? "bg-[#f5a623]" : "bg-gray-300 hover:bg-gray-400"
            )}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
