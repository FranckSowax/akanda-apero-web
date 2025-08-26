"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

export interface SlideProps {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  buttonAction?: () => void;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  secondaryButtonAction?: () => void;
  bgColor?: string;
}

interface SliderProps {
  slides: SlideProps[];
  autoplay?: boolean;
  autoplaySpeed?: number;
  className?: string;
}

export const Slider = ({
  slides,
  autoplay = true,
  autoplaySpeed = 5000,
  className,
}: SliderProps) => {
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
      className={cn(
        "relative w-full overflow-hidden",
        className
      )}
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className={cn(
              "min-w-full flex flex-col md:flex-row items-center justify-between py-16 px-4 md:px-12",
              slide.bgColor || "bg-[#f5e5a0]"
            )}
          >
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-800">{slide.title}</h1>
              <h2 className="text-xl md:text-2xl font-medium mb-4 text-gray-700">{slide.subtitle}</h2>
              <p className="text-gray-700 mb-6 max-w-md">{slide.description}</p>
              <div className="flex flex-wrap gap-4">
                <Link href={slide.buttonLink}>
                  <Button 
                    className="bg-[#f5a623] hover:bg-[#e09000] text-white rounded-full"
                    onClick={slide.buttonAction}
                  >
                    {slide.buttonText}
                  </Button>
                </Link>
                {slide.secondaryButtonText && (
                  <Link href={slide.secondaryButtonLink || "#"}>
                    <Button 
                      variant="outline" 
                      className="rounded-full"
                      onClick={slide.secondaryButtonAction}
                    >
                      {slide.secondaryButtonText}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="md:w-1/2 flex items-center justify-center relative">
              <div className="relative">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  width={500}
                  height={350}
                  className="rounded-lg shadow-xl object-cover transform transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button 
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-gray-700" />
      </button>
      
      <button 
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 text-gray-700" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
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
