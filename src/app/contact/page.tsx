'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '../../components/layout/Header';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Send, Clock, MessageCircle, Headphones, Star } from 'lucide-react';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique d'envoi du formulaire à implémenter ultérieurement
    alert('Votre message a été envoyé !');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Hero Contact - Large Card */}
          <motion.div 
            className="lg:col-span-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-8 text-white relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute bottom-10 left-10 w-24 h-24 bg-white rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">24/7</span>
              </div>
              
              <h1 className="text-5xl font-black mb-4 leading-tight">
                CONTACTEZ-NOUS
              </h1>
              <p className="text-lg mb-6 opacity-90 leading-relaxed">
                Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner dans vos commandes.
              </p>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 fill-current text-yellow-400" />
                  <span className="text-lg font-semibold">4.9</span>
                </div>
                <div className="text-sm opacity-75">+1000 clients satisfaits</div>
              </div>
              
              <div className="mt-auto">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-black">&lt; 30min</div>
                    <div className="text-sm opacity-75">Temps de réponse</div>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-black">24/7</div>
                    <div className="text-sm opacity-75">Support client</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Support Rapide */}
          <motion.div 
            className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 text-white relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="bg-yellow-400 text-blue-600 px-2 py-1 rounded-full text-xs font-bold">RAPIDE</span>
              </div>
              
              <h2 className="text-2xl font-black mb-2">SUPPORT DIRECT</h2>
              <p className="text-sm mb-4 opacity-90">
                Besoin d'aide immédiate ? Contactez-nous directement
              </p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-semibold">77 12 34 56</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-semibold">contact@akandaapero.fr</span>
                </div>
              </div>
              
              <button className="w-full bg-white text-blue-600 px-4 py-3 rounded-full font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg">
                APPELER MAINTENANT
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Deuxième rangée */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          {/* Formulaire de Contact */}
          <motion.div 
            className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Envoyez-nous un message</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
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
                    className="w-full rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
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
                  placeholder="votre@email.com" 
                  required 
                  className="w-full rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Sujet
                </label>
                <Input 
                  id="subject" 
                  name="subject" 
                  placeholder="Sujet de votre message" 
                  required 
                  className="w-full rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
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
                  rows={5}
                  className="w-full rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400 resize-none"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Send className="w-5 h-5 mr-2" />
                ENVOYER LE MESSAGE
              </Button>
            </form>
          </motion.div>
          
          {/* Informations & Localisation */}
          <div className="space-y-6">
            
            {/* Nos Coordonnées */}
            <motion.div 
              className="bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl p-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">NOS COORDONNÉES</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="font-semibold">Email</span>
                  </div>
                  <div className="text-sm opacity-90">
                    contact@akandaapero.fr<br />
                    info@akandaapero.fr
                  </div>
                </div>
                
                <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <Phone className="w-4 h-4" />
                    <span className="font-semibold">Téléphone</span>
                  </div>
                  <div className="text-sm opacity-90">
                    77 12 34 56<br />
                    66 98 76 54
                  </div>
                </div>
                
                <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-semibold">Adresse</span>
                  </div>
                  <div className="text-sm opacity-90">
                    Boulevard Triomphal<br />
                    Libreville, Gabon
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Horaires & Réseaux Sociaux */}
            <motion.div 
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">HORAIRES & RÉSEAUX</h3>
              </div>
              
              <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm mb-4">
                <div className="text-sm font-semibold mb-2">Horaires d'ouverture</div>
                <div className="text-sm opacity-90 space-y-1">
                  <div>Lun - Ven: 9h00 - 22h00</div>
                  <div>Sam - Dim: 10h00 - 23h00</div>
                  <div className="text-yellow-300 font-semibold">Support 24/7 disponible</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-semibold mb-3">Suivez-nous</div>
                <div className="flex space-x-3">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                     className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all duration-200 backdrop-blur-sm">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                     className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all duration-200 backdrop-blur-sm">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                     className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all duration-200 backdrop-blur-sm">
                    <Twitter className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
