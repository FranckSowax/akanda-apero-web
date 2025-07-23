/**
 * 🧪 Système A/B Testing - Akanda Apéro
 * 
 * Service complet pour les tests A/B avec tracking automatique
 * et intégration avec le système de monitoring
 */

interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // Pourcentage de trafic (0-100)
  config: Record<string, any>;
  isControl: boolean;
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  targetAudience: {
    percentage: number; // Pourcentage d'utilisateurs inclus
    conditions?: {
      newUsers?: boolean;
      returningUsers?: boolean;
      countries?: string[];
      devices?: ('mobile' | 'desktop' | 'tablet')[];
    };
  };
  variants: ABTestVariant[];
  metrics: {
    primary: string; // Métrique principale (ex: 'conversion_rate')
    secondary: string[]; // Métriques secondaires
  };
  results?: {
    [variantId: string]: {
      participants: number;
      conversions: number;
      conversionRate: number;
      confidence: number;
      isWinner?: boolean;
    };
  };
}

interface UserAssignment {
  userId: string;
  testId: string;
  variantId: string;
  assignedAt: string;
}

class ABTestingService {
  private tests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> testId -> variantId
  private monitoring: any;

  constructor() {
    this.loadTests();
    this.initializeMonitoring();
  }

  /**
   * 🔄 Initialiser le monitoring
   */
  private async initializeMonitoring() {
    try {
      const { monitoring } = await import('./monitoring');
      this.monitoring = monitoring;
    } catch (error) {
      console.warn('Monitoring non disponible pour A/B testing');
    }
  }

  /**
   * 📚 Charger les tests depuis la base de données
   */
  private async loadTests() {
    try {
      const response = await fetch('/api/ab-tests');
      const tests = await response.json();
      
      tests.forEach((test: ABTest) => {
        this.tests.set(test.id, test);
      });

      console.log(`📚 ${tests.length} tests A/B chargés`);
    } catch (error) {
      console.error('Erreur chargement tests A/B:', error);
    }
  }

  /**
   * 🎯 Assigner un utilisateur à une variante
   */
  assignUserToTest(userId: string, testId: string): string | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') {
      return null;
    }

    // Vérifier si l'utilisateur est déjà assigné
    const userTests = this.userAssignments.get(userId);
    if (userTests?.has(testId)) {
      return userTests.get(testId) || null;
    }

    // Vérifier si l'utilisateur correspond aux critères
    if (!this.isUserEligible(userId, test)) {
      return null;
    }

    // Assigner une variante basée sur les poids
    const variantId = this.selectVariant(userId, test);
    
    if (variantId) {
      // Enregistrer l'assignation
      if (!this.userAssignments.has(userId)) {
        this.userAssignments.set(userId, new Map());
      }
      this.userAssignments.get(userId)!.set(testId, variantId);

      // Sauvegarder en base
      this.saveUserAssignment(userId, testId, variantId);

      // Tracker l'événement
      this.trackTestAssignment(userId, testId, variantId);

      console.log(`🎯 Utilisateur ${userId} assigné à la variante ${variantId} du test ${testId}`);
    }

    return variantId;
  }

  /**
   * ✅ Vérifier l'éligibilité d'un utilisateur
   */
  private isUserEligible(userId: string, test: ABTest): boolean {
    // Vérifier le pourcentage de trafic
    const hash = this.hashUserId(userId);
    const trafficPercentage = (hash % 100) + 1;
    
    if (trafficPercentage > test.targetAudience.percentage) {
      return false;
    }

    // Ici vous pouvez ajouter d'autres critères d'éligibilité
    // basés sur test.targetAudience.conditions

    return true;
  }

  /**
   * 🎲 Sélectionner une variante
   */
  private selectVariant(userId: string, test: ABTest): string | null {
    const hash = this.hashUserId(userId + test.id);
    const random = (hash % 10000) / 100; // 0-99.99

    let cumulativeWeight = 0;
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (random < cumulativeWeight) {
        return variant.id;
      }
    }

    // Fallback sur la variante de contrôle
    return test.variants.find(v => v.isControl)?.id || test.variants[0]?.id || null;
  }

  /**
   * 🔢 Hash simple d'un ID utilisateur
   */
  private hashUserId(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * 💾 Sauvegarder l'assignation utilisateur
   */
  private async saveUserAssignment(userId: string, testId: string, variantId: string) {
    try {
      await fetch('/api/ab-tests/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          testId,
          variantId,
          assignedAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Erreur sauvegarde assignation:', error);
    }
  }

  /**
   * 📊 Tracker l'assignation de test
   */
  private trackTestAssignment(userId: string, testId: string, variantId: string) {
    if (!this.monitoring) return;

    this.monitoring.trackUserEvent({
      event: 'ab_test_assignment',
      properties: {
        testId,
        variantId,
        testName: this.tests.get(testId)?.name
      },
      userId,
      sessionId: this.generateSessionId(),
      timestamp: Date.now()
    });
  }

  /**
   * 🎯 Obtenir la variante pour un utilisateur
   */
  getUserVariant(userId: string, testId: string): string | null {
    // Vérifier le cache local
    const userTests = this.userAssignments.get(userId);
    if (userTests?.has(testId)) {
      return userTests.get(testId) || null;
    }

    // Assigner si pas encore fait
    return this.assignUserToTest(userId, testId);
  }

  /**
   * 🏆 Tracker une conversion
   */
  trackConversion(userId: string, testId: string, metric: string, value: number = 1) {
    const variantId = this.getUserVariant(userId, testId);
    if (!variantId) return;

    // Tracker l'événement de conversion
    if (this.monitoring) {
      this.monitoring.trackUserEvent({
        event: 'ab_test_conversion',
        properties: {
          testId,
          variantId,
          metric,
          value,
          testName: this.tests.get(testId)?.name
        },
        userId,
        sessionId: this.generateSessionId(),
        timestamp: Date.now()
      });
    }

    // Sauvegarder la conversion
    this.saveConversion(userId, testId, variantId, metric, value);

    console.log(`🏆 Conversion trackée: ${metric} = ${value} pour ${userId} (${testId}/${variantId})`);
  }

  /**
   * 💾 Sauvegarder une conversion
   */
  private async saveConversion(userId: string, testId: string, variantId: string, metric: string, value: number) {
    try {
      await fetch('/api/ab-tests/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          testId,
          variantId,
          metric,
          value,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Erreur sauvegarde conversion:', error);
    }
  }

  /**
   * 📈 Calculer les résultats d'un test
   */
  async calculateTestResults(testId: string): Promise<ABTest['results']> {
    try {
      const response = await fetch(`/api/ab-tests/${testId}/results`);
      const results = await response.json();

      // Mettre à jour le cache local
      const test = this.tests.get(testId);
      if (test) {
        test.results = results;
        this.tests.set(testId, test);
      }

      return results;
    } catch (error) {
      console.error('Erreur calcul résultats:', error);
      return {};
    }
  }

  /**
   * 🎯 Créer un nouveau test A/B
   */
  async createTest(testConfig: Omit<ABTest, 'id' | 'results'>): Promise<string> {
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const test: ABTest = {
      ...testConfig,
      id: testId,
      status: 'draft'
    };

    // Valider la configuration
    if (!this.validateTestConfig(test)) {
      throw new Error('Configuration de test invalide');
    }

    // Sauvegarder en base
    await fetch('/api/ab-tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test)
    });

    // Ajouter au cache local
    this.tests.set(testId, test);

    console.log(`🧪 Test A/B créé: ${testId}`);
    return testId;
  }

  /**
   * ✅ Valider la configuration d'un test
   */
  private validateTestConfig(test: ABTest): boolean {
    // Vérifier que les poids des variantes totalisent 100%
    const totalWeight = test.variants.reduce((sum, variant) => sum + variant.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      console.error('Les poids des variantes doivent totaliser 100%');
      return false;
    }

    // Vérifier qu'il y a au moins une variante de contrôle
    const hasControl = test.variants.some(v => v.isControl);
    if (!hasControl) {
      console.error('Au moins une variante doit être marquée comme contrôle');
      return false;
    }

    return true;
  }

  /**
   * ▶️ Démarrer un test
   */
  async startTest(testId: string) {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error('Test non trouvé');
    }

    test.status = 'running';
    test.startDate = new Date().toISOString();

    await this.updateTest(test);
    console.log(`▶️ Test démarré: ${testId}`);
  }

  /**
   * ⏸️ Mettre en pause un test
   */
  async pauseTest(testId: string) {
    const test = this.tests.get(testId);
    if (!test) return;

    test.status = 'paused';
    await this.updateTest(test);
    console.log(`⏸️ Test mis en pause: ${testId}`);
  }

  /**
   * 🏁 Terminer un test
   */
  async completeTest(testId: string) {
    const test = this.tests.get(testId);
    if (!test) return;

    test.status = 'completed';
    test.endDate = new Date().toISOString();

    // Calculer les résultats finaux
    await this.calculateTestResults(testId);
    
    await this.updateTest(test);
    console.log(`🏁 Test terminé: ${testId}`);
  }

  /**
   * 🔄 Mettre à jour un test
   */
  private async updateTest(test: ABTest) {
    try {
      await fetch(`/api/ab-tests/${test.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test)
      });

      this.tests.set(test.id, test);
    } catch (error) {
      console.error('Erreur mise à jour test:', error);
    }
  }

  /**
   * 📊 Obtenir tous les tests
   */
  getAllTests(): ABTest[] {
    return Array.from(this.tests.values());
  }

  /**
   * 🔍 Obtenir un test spécifique
   */
  getTest(testId: string): ABTest | undefined {
    return this.tests.get(testId);
  }

  /**
   * 🎯 Obtenir les tests actifs pour un utilisateur
   */
  getActiveTestsForUser(userId: string): Array<{ testId: string; variantId: string; config: any }> {
    const activeTests: Array<{ testId: string; variantId: string; config: any }> = [];

    for (const test of this.tests.values()) {
      if (test.status === 'running') {
        const variantId = this.getUserVariant(userId, test.id);
        if (variantId) {
          const variant = test.variants.find(v => v.id === variantId);
          if (variant) {
            activeTests.push({
              testId: test.id,
              variantId,
              config: variant.config
            });
          }
        }
      }
    }

    return activeTests;
  }

  /**
   * 🔧 Utilitaires
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 📈 Obtenir les statistiques de performance d'un test
   */
  async getTestPerformance(testId: string) {
    const results = await this.calculateTestResults(testId);
    const test = this.tests.get(testId);
    
    if (!test || !results) return null;

    // Calculer la significativité statistique
    const variants = Object.entries(results);
    const control = variants.find(([variantId]) => 
      test.variants.find(v => v.id === variantId)?.isControl
    );

    if (!control) return results;

    const [controlId, controlData] = control;
    const performanceData: any = {};

    variants.forEach(([variantId, data]) => {
      if (variantId === controlId) {
        performanceData[variantId] = {
          ...data,
          lift: 0,
          significance: 'control'
        };
      } else {
        const lift = ((data.conversionRate - controlData.conversionRate) / controlData.conversionRate) * 100;
        const significance = this.calculateSignificance(controlData, data);
        
        performanceData[variantId] = {
          ...data,
          lift,
          significance
        };
      }
    });

    return performanceData;
  }

  /**
   * 📊 Calculer la significativité statistique (test Z simple)
   */
  private calculateSignificance(control: any, variant: any): string {
    const n1 = control.participants;
    const n2 = variant.participants;
    const p1 = control.conversionRate / 100;
    const p2 = variant.conversionRate / 100;

    if (n1 < 30 || n2 < 30) return 'insufficient_data';

    const pooledP = ((control.conversions + variant.conversions) / (n1 + n2));
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
    const z = Math.abs(p2 - p1) / se;

    if (z > 2.576) return 'significant_99'; // 99% de confiance
    if (z > 1.96) return 'significant_95';  // 95% de confiance
    if (z > 1.645) return 'significant_90'; // 90% de confiance
    
    return 'not_significant';
  }
}

// Instance singleton
export const abTesting = new ABTestingService();

// Hook React pour faciliter l'utilisation
export const useABTest = (testId: string, userId?: string) => {
  const [variant, setVariant] = React.useState<string | null>(null);
  const [config, setConfig] = React.useState<any>(null);

  React.useEffect(() => {
    if (!userId) return;

    const variantId = abTesting.getUserVariant(userId, testId);
    setVariant(variantId);

    if (variantId) {
      const test = abTesting.getTest(testId);
      const variantConfig = test?.variants.find(v => v.id === variantId)?.config;
      setConfig(variantConfig);
    }
  }, [testId, userId]);

  const trackConversion = (metric: string, value: number = 1) => {
    if (userId) {
      abTesting.trackConversion(userId, testId, metric, value);
    }
  };

  return { variant, config, trackConversion };
};

export default abTesting;
