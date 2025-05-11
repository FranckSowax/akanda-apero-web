'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLoyalty } from '../../../hooks/supabase/useLoyalty';
import { useAuth } from '../../../hooks/supabase/useAuth';
import { Progress } from '../../../components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { useToast } from '../../../components/ui/use-toast';
import UserAccountLayout from '../../../components/layout/UserAccountLayout';
import { formatDate } from '../../../lib/utils';

const tiers = [
  { name: 'Citron', min: 0, max: 99, color: '#E3FF00', benefits: ['Accès au programme de fidélité'] },
  { name: 'Mojito', min: 100, max: 299, color: '#AAFF87', benefits: ['Réduction de 500 FCFA sur toutes les commandes', 'Accès aux ventes privées'] },
  { name: 'Piña Colada', min: 300, max: 499, color: '#FFF0C1', benefits: ['Réduction de 1000 FCFA sur toutes les commandes', 'Livraison gratuite', 'Accès aux ventes privées'] },
  { name: 'Daiquiri', min: 500, max: Infinity, color: '#FF9A8C', benefits: ['Réduction de 2000 FCFA sur toutes les commandes', 'Livraison prioritaire', 'Accès anticipé aux nouveaux produits', 'Cadeau surprise à chaque commande'] }
];

// Fonction utilitaire pour formater une date
const formatDateString = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export default function LoyaltyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { 
    loyaltyData, 
    isLoading: pointsLoading, 
    transactions, 
    transactionsLoading, 
    redeemPoints 
  } = useLoyalty();
  const { toast } = useToast();
  
  const loading = authLoading || pointsLoading;
  
  // Rediriger si non connecté
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);
  
  if (loading) {
    return (
      <UserAccountLayout>
        <div className="flex justify-center p-8">Chargement de votre programme de fidélité...</div>
      </UserAccountLayout>
    );
  }
  
  if (!user) {
    return (
      <UserAccountLayout>
        <div className="flex flex-col items-center justify-center p-8">
          <h1 className="text-2xl font-bold mb-4">Programme de fidélité</h1>
          <p>Connectez-vous pour accéder à votre programme de fidélité Akanda Apero.</p>
        </div>
      </UserAccountLayout>
    );
  }
  
  const currentTier = loyaltyData 
    ? tiers.find(tier => tier.name === loyaltyData.tier) || tiers[0]
    : tiers[0];
    
  const nextTier = currentTier.name !== 'Platine' 
    ? tiers[tiers.findIndex(tier => tier.name === currentTier.name) + 1] 
    : null;
  
  const pointsToNextTier = nextTier 
    ? nextTier.min - (loyaltyData?.lifetime_points || 0) 
    : 0;
    
  const progressToNextTier = nextTier 
    ? ((loyaltyData?.lifetime_points || 0) - currentTier.min) / (nextTier.min - currentTier.min) * 100 
    : 100;
  
  const handleRedeemPoints = async (pointsCost: number, reward: string) => {
    try {
      if (!loyaltyData || loyaltyData.points_balance < pointsCost) {
        toast({
          title: "Points insuffisants",
          description: "Vous n'avez pas assez de points pour cette récompense.",
          variant: "destructive"
        });
        return;
      }
      
      // Utiliser redeemPoints comme fonction directement, pas comme objet avec mutateAsync
      redeemPoints({
        points: pointsCost,
        description: `Points utilisés pour ${reward}`
      });
      
      toast({
        title: "Récompense réclamée",
        description: `Vous avez utilisé ${pointsCost} points pour obtenir "${reward}".`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de l'échange de points.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <UserAccountLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Mon programme de fidélité</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Mon statut</CardTitle>
              <CardDescription>Votre niveau de fidélité actuel et vos avantages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full flex items-center justify-center text-white font-bold" 
                     style={{ backgroundColor: currentTier.color }}>
                  {currentTier.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{currentTier.name}</h3>
                  <p className="text-sm text-gray-500">
                    {loyaltyData?.points_balance || 0} points disponibles
                  </p>
                </div>
              </div>
              
              {nextTier && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progression vers {nextTier.name}</span>
                    <span>{pointsToNextTier} points restants</span>
                  </div>
                  <Progress value={progressToNextTier} className="h-2" />
                </div>
              )}
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Vos avantages actuels :</h4>
                <ul className="list-disc list-inside">
                  {currentTier.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm">{benefit}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Historique des points</CardTitle>
              <CardDescription>Suivi de vos transactions de points</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <p className="text-center py-4 text-gray-500">Chargement de l'historique...</p>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="border-b pb-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-sm">
                          {transaction.points_earned > 0
                            ? `+${transaction.points_earned} points`
                            : `-${transaction.points_redeemed} points`}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateString(transaction.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{transaction.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">
                  Aucune transaction de points pour le moment
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="tiers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tiers">Niveaux de fidélité</TabsTrigger>
            <TabsTrigger value="rewards">Récompenses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tiers" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.map((tier) => (
                <Card key={tier.name} className={`${tier.name === currentTier.name ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader style={{ backgroundColor: `${tier.color}20` }}>
                    <CardTitle className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full" style={{ backgroundColor: tier.color }}></span>
                      {tier.name}
                    </CardTitle>
                    <CardDescription>{tier.min}+ points</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="list-disc list-inside space-y-1">
                      {tier.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm">{benefit}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="rewards" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Utiliser vos points</CardTitle>
                <CardDescription>
                  Échangez vos points contre des réductions et récompenses exclusives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Réduction de 500 FCFA</CardTitle>
                      <CardDescription>50 points</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">Obtenez une réduction immédiate de 500 FCFA sur votre prochaine commande</p>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled={(loyaltyData?.points_balance || 0) < 50}
                        onClick={() => handleRedeemPoints(50, "Réduction de 500 FCFA")}
                      >
                        Échanger
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Kit de décoration</CardTitle>
                      <CardDescription>75 points</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">Recevez un kit de décoration pour vos cocktails (fruits séchés, parasols, pailles)</p>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled={(loyaltyData?.points_balance || 0) < 75}
                        onClick={() => handleRedeemPoints(75, "Kit de décoration cocktail")}
                      >
                        Échanger
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Recettes exclusives</CardTitle>
                      <CardDescription>120 points</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">Recevez un livret de 5 recettes exclusives de cocktails signature Akanda</p>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled={(loyaltyData?.points_balance || 0) < 120}
                        onClick={() => handleRedeemPoints(120, "Livret de recettes exclusives")}
                      >
                        Échanger
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UserAccountLayout>
  );
}
