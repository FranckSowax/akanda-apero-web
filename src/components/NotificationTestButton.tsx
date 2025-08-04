'use client';

import React, { useState } from 'react';
import { useAudioAlert } from '../utils/audioAlert';

export default function NotificationTestButton() {
  const [isPlaying, setIsPlaying] = useState(false);
  const { playAlert, stopAlert, requestPermission } = useAudioAlert();

  const handleTest = async () => {
    if (isPlaying) {
      stopAlert();
      setIsPlaying(false);
    } else {
      await requestPermission();
      await playAlert();
      setIsPlaying(true);
      
      // Arrêter automatiquement après 10 secondes
      setTimeout(() => {
        stopAlert();
        setIsPlaying(false);
      }, 10000);
    }
  };

  return (
    <button
      onClick={handleTest}
      className={`fixed bottom-4 right-4 p-4 rounded-full shadow-lg transition-all z-50 ${
        isPlaying 
          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`}
      title={isPlaying ? 'Arrêter le test' : 'Tester l\'alerte sonore'}
    >
      {isPlaying ? '⏹️' : '🔊'}
    </button>
  );
}
