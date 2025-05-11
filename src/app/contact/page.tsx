'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique d'envoi du formulaire à implémenter ultérieurement
    alert('Votre message a été envoyé !');
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      {/* Hero Section avec Image de Fond */}
      <div className="relative w-full h-[30vh] sm:h-[40vh] md:h-[50vh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://i.imgur.com/b4mbNPB.jpeg" 
            alt="Akanda Apéro Contact"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4">Contactez-nous</h1>
          <p className="text-base sm:text-lg md:text-xl text-white max-w-2xl px-2">
            Notre équipe est à votre disposition pour répondre à toutes vos questions
          </p>
        </div>
      </div>
      
      {/* Section de Contact */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Informations de Contact */}
            <div className="space-y-6 md:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Restons en contact</h2>
                <p className="text-gray-600 mb-6 md:mb-8 text-sm sm:text-base">
                  Nous sommes disponibles pour vous aider avec vos commandes, répondre à vos questions ou simplement discuter de votre prochain apéro.
                </p>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="bg-amber-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600 text-sm sm:text-base">contact@akandaapero.fr</p>
                    <p className="text-gray-600 text-sm sm:text-base">info@akandaapero.fr</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="bg-amber-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                    <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">Téléphone</h3>
                    <p className="text-gray-600 text-sm sm:text-base">+241 77 12 34 56</p>
                    <p className="text-gray-600 text-sm sm:text-base">+241 66 98 76 54</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="bg-amber-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">Adresse</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Boulevard Triomphal</p>
                    <p className="text-gray-600 text-sm sm:text-base">Libreville, Gabon</p>
                  </div>
                </div>
              </div>
              
              {/* Réseaux Sociaux */}
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Suivez-nous</h3>
                <div className="flex space-x-3 sm:space-x-4">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                     className="bg-amber-100 hover:bg-amber-200 p-2 sm:p-3 rounded-full transition-colors duration-200 touch-action-manipulation">
                    <Facebook className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                     className="bg-amber-100 hover:bg-amber-200 p-2 sm:p-3 rounded-full transition-colors duration-200 touch-action-manipulation">
                    <Instagram className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                     className="bg-amber-100 hover:bg-amber-200 p-2 sm:p-3 rounded-full transition-colors duration-200 touch-action-manipulation">
                    <Twitter className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Formulaire de Contact */}
            <div className="bg-gray-50 p-5 sm:p-6 md:p-8 rounded-lg shadow-sm mt-6 md:mt-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Prénom
                    </label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      placeholder="Votre prénom" 
                      required 
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Nom
                    </label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      placeholder="Votre nom" 
                      required 
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="votre.email@exemple.com" 
                    required 
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Sujet
                  </label>
                  <Input 
                    id="subject" 
                    name="subject" 
                    placeholder="Le sujet de votre message" 
                    required 
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    placeholder="Votre message..." 
                    required 
                    className="w-full min-h-[150px]"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#f5a623] hover:bg-[#e09000] flex items-center justify-center h-11 text-base"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer le message
                </Button>
              </form>
            </div>
            
          </div>
        </div>
      </section>
      
      {/* Map Section - À implémenter avec une carte Google Maps ou autre service */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-4 sm:mb-8">Où nous trouver</h2>
          <div className="h-[250px] sm:h-[300px] md:h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 text-sm sm:text-base">Carte interactive à intégrer</p>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
