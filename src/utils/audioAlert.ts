/**
 * Générateur de sons d'alerte pour les nouvelles commandes
 * Utilise Web Audio API pour créer des sons sans fichiers externes
 */

class AudioAlertGenerator {
  private audioContext: AudioContext | null = null;
  private isPlaying = false;
  private repeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Initialiser le contexte audio de manière lazy
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      // Créer le contexte audio seulement côté client
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    } catch (error) {
      console.warn('Web Audio API non supportée:', error);
      this.audioContext = null;
    }
  }

  /**
   * Générer un son d'alerte puissant avec répétition
   */
  async playOrderAlert(): Promise<void> {
    if (!this.audioContext) return;

    try {
      // Reprendre le contexte audio si suspendu
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isPlaying = true;

      // Jouer la première séquence
      await this.playAlertSequence();

      // Répéter toutes les 6 secondes (zen, très espacé)
      this.repeatInterval = setInterval(async () => {
        if (this.isPlaying) {
          await this.playAlertSequence();
        }
      }, 6000);

    } catch (error) {
      console.error('Erreur lors de la lecture du son:', error);
    }
  }

  private async playAlertSequence(): Promise<void> {
    if (!this.audioContext) return;

    // Mélodie zen inspirée des carillons apaisants
    // Utilise des fréquences douces pour un son harmonieux et non intrusif
    const sequence = [
      // Phrase ascendante douce (La-Do-Mi)
      { frequency: 440.00, duration: 0.4, volume: 0.3 }, // La4
      { frequency: 0, duration: 0.1, volume: 0 },        // Pause
      { frequency: 523.25, duration: 0.4, volume: 0.35 }, // Do5
      { frequency: 0, duration: 0.1, volume: 0 },        // Pause
      { frequency: 659.25, duration: 0.6, volume: 0.4 }, // Mi5 (plus long)
      
      // Pause contemplative
      { frequency: 0, duration: 0.4, volume: 0 },
      
      // Phrase descendante (Mi-Do-La) - retour au calme
      { frequency: 659.25, duration: 0.3, volume: 0.3 }, // Mi5
      { frequency: 0, duration: 0.1, volume: 0 },        // Pause
      { frequency: 523.25, duration: 0.3, volume: 0.25 }, // Do5
      { frequency: 0, duration: 0.1, volume: 0 },        // Pause
      { frequency: 440.00, duration: 0.8, volume: 0.2 }, // La4 (conclusion très douce)
    ];

    let currentTime = this.audioContext.currentTime;

    for (const note of sequence) {
      if (note.frequency > 0) {
        this.playZenTone(note.frequency, currentTime, note.duration, note.volume);
      }
      currentTime += note.duration;
    }
  }

  private playZenTone(frequency: number, startTime: number, duration: number, volume: number): void {
    if (!this.audioContext) return;

    // Oscillateur principal très doux pour style zen
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Filtre passe-bas pour adoucir le son
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, startTime);
    filter.Q.setValueAtTime(1, startTime);

    // Configuration pour un son très doux
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Fade très progressif pour éviter les clics
    const fadeTime = Math.min(0.1, duration * 0.2);
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.5, startTime + fadeTime);
    gainNode.gain.exponentialRampToValueAtTime(volume, startTime + duration * 0.4);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.3, startTime + duration - fadeTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    // Connexions avec filtre pour son zen
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  /**
   * Arrêter tous les sons
   */
  stopAlert(): void {
    this.isPlaying = false;
    
    if (this.repeatInterval) {
      clearInterval(this.repeatInterval);
      this.repeatInterval = null;
    }
  }

  /**
   * Vérifier si l'audio est supporté
   */
  isAudioSupported(): boolean {
    return this.audioContext !== null;
  }

  /**
   * Demander la permission audio (requis sur certains navigateurs)
   */
  async requestAudioPermission(): Promise<boolean> {
    if (!this.audioContext) return false;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return true;
    } catch (error) {
      console.error('Permission audio refusée:', error);
      return false;
    }
  }
}

// Instance singleton
let audioAlertInstance: AudioAlertGenerator | null = null;

export function getAudioAlert(): AudioAlertGenerator {
  if (!audioAlertInstance) {
    audioAlertInstance = new AudioAlertGenerator();
  }
  return audioAlertInstance;
}

// Hook React pour utiliser l'alerte audio
export function useAudioAlert() {
  const audioAlert = getAudioAlert();

  const playAlert = async () => {
    await audioAlert.playOrderAlert();
  };

  const stopAlert = () => {
    audioAlert.stopAlert();
  };

  const requestPermission = async () => {
    return await audioAlert.requestAudioPermission();
  };

  // Vérifier le support audio seulement côté client
  const isSupported = typeof window !== 'undefined' ? audioAlert.isAudioSupported() : false;

  return {
    playAlert,
    stopAlert,
    requestPermission,
    isSupported
  };
}
