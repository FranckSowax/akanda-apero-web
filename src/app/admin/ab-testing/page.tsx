'use client';

/**
 * 🧪 Page Admin A/B Testing - Akanda Apéro
 * 
 * Interface complète pour gérer les tests A/B
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  targetAudience: {
    percentage: number;
    conditions?: any;
  };
  metrics: {
    primary: string;
    secondary: string[];
  };
  variants: Array<{
    id: string;
    name: string;
    weight: number;
    config: any;
    isControl: boolean;
  }>;
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

export default function ABTestingAdminPage() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTest, setNewTest] = useState<Partial<ABTest>>({
    name: '',
    description: '',
    targetAudience: { percentage: 100 },
    metrics: { primary: 'conversion_rate', secondary: [] },
    variants: [
      { id: 'control', name: 'Contrôle', weight: 50, config: {}, isControl: true },
      { id: 'variant_a', name: 'Variante A', weight: 50, config: {}, isControl: false }
    ]
  });

  // Charger les tests
  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const response = await fetch('/api/ab-tests');
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error('Erreur chargement tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTest = async () => {
    try {
      const response = await fetch('/api/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });

      if (response.ok) {
        await loadTests();
        setShowCreateDialog(false);
        setNewTest({
          name: '',
          description: '',
          targetAudience: { percentage: 100 },
          metrics: { primary: 'conversion_rate', secondary: [] },
          variants: [
            { id: 'control', name: 'Contrôle', weight: 50, config: {}, isControl: true },
            { id: 'variant_a', name: 'Variante A', weight: 50, config: {}, isControl: false }
          ]
        });
      }
    } catch (error) {
      console.error('Erreur création test:', error);
    }
  };

  const updateTestStatus = async (testId: string, action: 'start' | 'pause' | 'complete') => {
    try {
      const response = await fetch(`/api/ab-tests/${testId}/${action}`, {
        method: 'POST'
      });

      if (response.ok) {
        await loadTests();
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
    }
  };

  const loadTestResults = async (testId: string) => {
    try {
      const response = await fetch(`/api/ab-tests/${testId}/results`);
      const results = await response.json();
      
      setTests(prev => prev.map(test => 
        test.id === testId ? { ...test, results } : test
      ));
    } catch (error) {
      console.error('Erreur chargement résultats:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { color: 'bg-gray-500', icon: Clock, text: 'Brouillon' },
      running: { color: 'bg-green-500', icon: Play, text: 'En cours' },
      paused: { color: 'bg-yellow-500', icon: Pause, text: 'En pause' },
      completed: { color: 'bg-blue-500', icon: CheckCircle, text: 'Terminé' }
    };

    const variant = variants[status as keyof typeof variants] || variants.draft;
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {variant.text}
      </Badge>
    );
  };

  const addVariant = () => {
    const newVariantId = `variant_${String.fromCharCode(65 + (newTest.variants?.length || 1))}`;
    setNewTest(prev => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        {
          id: newVariantId,
          name: `Variante ${String.fromCharCode(65 + (prev.variants?.length || 1))}`,
          weight: 0,
          config: {},
          isControl: false
        }
      ]
    }));
  };

  const updateVariantWeight = (index: number, weight: number) => {
    setNewTest(prev => ({
      ...prev,
      variants: prev.variants?.map((variant, i) => 
        i === index ? { ...variant, weight } : variant
      )
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🧪 Tests A/B</h1>
          <p className="text-gray-600">Gérez vos expérimentations et optimisations</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau test A/B</DialogTitle>
              <DialogDescription>
                Configurez votre expérimentation pour optimiser les conversions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="test-name">Nom du test</Label>
                <Input
                  id="test-name"
                  value={newTest.name}
                  onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Test couleur bouton CTA"
                />
              </div>

              <div>
                <Label htmlFor="test-description">Description</Label>
                <Textarea
                  id="test-description"
                  value={newTest.description}
                  onChange={(e) => setNewTest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez l'objectif de ce test..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="audience-percentage">% d'audience</Label>
                  <Input
                    id="audience-percentage"
                    type="number"
                    min="1"
                    max="100"
                    value={newTest.targetAudience?.percentage}
                    onChange={(e) => setNewTest(prev => ({
                      ...prev,
                      targetAudience: { ...prev.targetAudience, percentage: parseInt(e.target.value) }
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="primary-metric">Métrique principale</Label>
                  <Select
                    value={newTest.metrics?.primary}
                    onValueChange={(value) => setNewTest(prev => ({
                      ...prev,
                      metrics: { ...prev.metrics, primary: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversion_rate">Taux de conversion</SelectItem>
                      <SelectItem value="click_rate">Taux de clic</SelectItem>
                      <SelectItem value="purchase_rate">Taux d'achat</SelectItem>
                      <SelectItem value="signup_rate">Taux d'inscription</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Variantes</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="w-3 h-3 mr-1" />
                    Ajouter
                  </Button>
                </div>

                <div className="space-y-2">
                  {newTest.variants?.map((variant, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <Input
                        value={variant.name}
                        onChange={(e) => setNewTest(prev => ({
                          ...prev,
                          variants: prev.variants?.map((v, i) => 
                            i === index ? { ...v, name: e.target.value } : v
                          )
                        }))}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={variant.weight}
                        onChange={(e) => updateVariantWeight(index, parseInt(e.target.value))}
                        className="w-20"
                        placeholder="%"
                      />
                      {variant.isControl && (
                        <Badge variant="outline">Contrôle</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={createTest} className="bg-orange-500 hover:bg-orange-600">
                  Créer le test
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tests actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {tests.filter(t => t.status === 'running').length}
                </p>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En brouillon</p>
                <p className="text-2xl font-bold text-gray-600">
                  {tests.filter(t => t.status === 'draft').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terminés</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tests.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-orange-600">{tests.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des tests */}
      <div className="grid gap-4">
        {tests.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {test.name}
                    {getStatusBadge(test.status)}
                  </CardTitle>
                  <CardDescription>{test.description}</CardDescription>
                </div>

                <div className="flex gap-2">
                  {test.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => updateTestStatus(test.id, 'start')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Démarrer
                    </Button>
                  )}

                  {test.status === 'running' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTestStatus(test.id, 'pause')}
                      >
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateTestStatus(test.id, 'complete')}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Square className="w-3 h-3 mr-1" />
                        Terminer
                      </Button>
                    </>
                  )}

                  {test.status === 'paused' && (
                    <Button
                      size="sm"
                      onClick={() => updateTestStatus(test.id, 'start')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Reprendre
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadTestResults(test.id)}
                  >
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Résultats
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {test.targetAudience.percentage}% d'audience
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    Métrique: {test.metrics.primary}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {test.variants.length} variantes
                  </span>
                </div>
              </div>

              {/* Résultats des variantes */}
              {test.results && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Résultats par variante</h4>
                  <div className="grid gap-2">
                    {Object.entries(test.results).map(([variantId, results]) => {
                      const variant = test.variants.find(v => v.id === variantId);
                      return (
                        <div key={variantId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{variant?.name}</span>
                            {results.isWinner && (
                              <Badge className="bg-green-500 text-white">🏆 Gagnant</Badge>
                            )}
                            {variant?.isControl && (
                              <Badge variant="outline">Contrôle</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span>{results.participants} participants</span>
                            <span>{results.conversions} conversions</span>
                            <span className="font-semibold">
                              {results.conversionRate}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {tests.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucun test A/B
              </h3>
              <p className="text-gray-500 mb-4">
                Créez votre premier test pour commencer à optimiser vos conversions
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Créer un test
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
