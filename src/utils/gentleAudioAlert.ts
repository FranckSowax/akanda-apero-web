/**
 * Variante douce de l'alerte audio pour environnements sensibles
 * Utilise des sons plus subtils et apaisants
 */

export class GentleAudioAlert {
  private audioContext: AudioContext | null = null;
  private isPlaying = false;
  private repeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    } catch (error) {
      console.warn('Web Audio API non supportée:', error);
      this.audioContext = null;
    }
  }

  /**
   * Jouer une mélodie très douce et apaisante
   */
  async playGentleAlert(): Promise<void> {
    if (!this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isPlaying = true;
      await this.playGentleSequence();

      // Répéter toutes les 6 secondes (très espacé)
      this.repeatInterval = setInterval(async () => {
        if (this.isPlaying) {
          await this.playGentleSequence();
        }
      }, 6000);

    } catch (error) {
      console.error('Erreur lors de la lecture du son doux:', error);
    }
  }

  private async playGentleSequence(): Promise<void> {
    if (!this.audioContext) return;

    // Mélodie inspirée des carillons zen - très apaisante
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
        this.playGentleTone(note.frequency, currentTime, note.duration, note.volume);
      }
      currentTime += note.duration;
    }
  }

  private playGentleTone(frequency: number, startTime: number, duration: number, volume: number): void {
    if (!this.audioContext) return;

    // Oscillateur principal très doux
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

    // Connexions avec filtre
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  stopAlert(): void {
    this.isPlaying = false;
    if (this.repeatInterval) {
      clearInterval(this.repeatInterval);
      this.repeatInterval = null;
    }
  }

  isAudioSupported(): boolean {
    return this.audioContext !== null;
  }

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

// Instance singleton pour la variante douce
let gentleAudioInstance: GentleAudioAlert | null = null;

export function getGentleAudioAlert(): GentleAudioAlert {
  if (!gentleAudioInstance) {
    gentleAudioInstance = new GentleAudioAlert();
  }
  return gentleAudioInstance;
}

// Hook pour utiliser l'alerte douce
export function useGentleAudioAlert() {
  const gentleAlert = getGentleAudioAlert();

  const playGentleAlert = async () => {
    await gentleAlert.playGentleAlert();
  };

  const stopAlert = () => {
    gentleAlert.stopAlert();
  };

  const requestPermission = async () => {
    return await gentleAlert.requestAudioPermission();
  };

  const isSupported = typeof window !== 'undefined' ? gentleAlert.isAudioSupported() : false;

  return {
    playGentleAlert,
    stopAlert,
    requestPermission,
    isSupported
  };
}
