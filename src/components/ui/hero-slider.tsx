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
            className="min-w-full relative h-[380px] xs:h-[420px] sm:h-[500px] md:h-[600px] overflow-hidden" 
          >
            <Image
              src={slide.backgroundUrl}
              alt={slide.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center w-full h-full"
            />
            {/* Overlay pour assurer la lisibilité du texte */}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="container mx-auto px-2 sm:px-6 relative z-10">
              <div className="flex flex-col justify-center items-center h-full py-6 sm:py-12 md:py-20 text-center">
                <div className="w-full max-w-sm xs:max-w-md sm:max-w-lg md:max-w-2xl px-3 xs:px-4 sm:px-8 py-4 xs:py-6 sm:py-10 bg-black bg-opacity-40 backdrop-blur-sm rounded-lg">
                  <h1 className={cn(styles.largeHeading, "text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl", "text-white")}>
                    {slide.title} <span className={styles.accentText}>{slide.subtitle}</span>
                  </h1>
                  <p className={cn("mb-4 xs:mb-6 sm:mb-8 text-xs xs:text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed", "text-white")}>
                    {slide.description}
                  </p>
                  
                  {slide.statValue && (
                    <div className="mt-3 xs:mt-4 border-t border-white border-opacity-30 pt-3 xs:pt-4">
                      <div className={cn(styles.stat, "text-white text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold")}>{slide.statValue}</div>
                      <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-white mt-1">{slide.statLabel}</p>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button 
        className="absolute top-1/2 left-1 xs:left-2 sm:left-4 transform -translate-y-1/2 bg-white/80 p-1 xs:p-1.5 sm:p-2 rounded-full shadow-md hover:bg-white transition-colors z-10 touch-manipulation"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-700" />
      </button>
      
      <button 
        className="absolute top-1/2 right-1 xs:right-2 sm:right-4 transform -translate-y-1/2 bg-white/80 p-1 xs:p-1.5 sm:p-2 rounded-full shadow-md hover:bg-white transition-colors z-10 touch-manipulation"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-700" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-2 xs:bottom-3 sm:bottom-4 md:bottom-6 left-0 right-0 flex justify-center gap-0.5 xs:gap-1 sm:gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-3 sm:h-3 rounded-full transition-colors touch-manipulation",
              index === currentSlide 
                ? "bg-white" 
                : "bg-white/50 hover:bg-white/80"
            )}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
