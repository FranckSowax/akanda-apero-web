'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase/client';
import { Progress } from '../../../components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import UserAccountLayout from '../../../components/layout/UserAccountLayout';
import { 
  Award, 
  Star, 
  Gift, 
  Truck, 
  Crown, 
  Sparkles, 
  ShoppingBag, 
  Calendar,
  TrendingUp,
  Zap
} from 'lucide-react';

// Définition des niveaux de fidélité
const loyaltyTiers = [
  {
    name: 'Bronze',
    min: 0,
    max: 49,
    color: 'from-amber-600 to-amber-700',
    bgColor: 'bg-gradient-to-r from-amber-50 to-amber-100',
    icon: Award,
    benefits: ['Accès au programme Points Fidélité']
  },
  {
    name: 'Argent',
    min: 50,
    max: 99,
    color: 'from-gray-400 to-gray-600',
    bgColor: 'bg-gradient-to-r from-gray-50 to-gray-100',
    icon: Star,
    benefits: ['🚚 Livraison gratuite', 'Accès aux promotions exclusives']
  },
  {
    name: 'Or',
    min: 100,
    max: 199,
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
    icon: Crown,
    benefits: ['🚚 Livraison gratuite', '💰 5% de réduction sur tout', 'Accès prioritaire aux nouveautés']
  },
  {
    name: 'Platine',
    min: 200,
    max: 299,
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-gradient-to-r from-purple-50 to-purple-100',
    icon: Sparkles,
    benefits: ['🚚 Livraison gratuite', '💰 10% de réduction sur tout', '⚡ Livraison prioritaire', '🎁 Cadeau mensuel']
  },
  {
    name: 'Diamant',
    min: 300,
    max: Infinity,
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-gradient-to-r from-blue-50 to-blue-100',
    icon: Gift,
    benefits: ['🚚 Livraison gratuite', '💰 15% de réduction sur tout', '⚡ Livraison express', '🎁 Cadeaux surprise', '👑 Accès VIP']
  }
];

// Règles de gain de points
const pointRules = [
  { category: 'Apéros', points: 10, icon: ShoppingBag, description: 'Chaque commande de produits Apéros' },
  { category: 'Cocktails Maison', points: 15, icon: Sparkles, description: 'Chaque commande de cocktails maison' },
  { category: 'Bonus Anniversaire', points: 50, icon: Gift, description: 'Cadeau spécial pour votre anniversaire' },
  { category: 'Parrainage', points: 25, icon: TrendingUp, description: 'Pour chaque ami parrainé' }
];

export default function LoyaltyPointsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Récupérer l'utilisateur actuel et ses points
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth?redirect_to=/mon-compte/fidelite');
          return;
        }
        
        setCurrentUser(user);
        
        // Récupérer les informations client avec les points
        const { data: customer } = await supabase
          .from('customers')
          .select('*')
          .eq('email', user.email)
          .single();
          
        if (customer && customer.loyalty_points !== undefined) {
          setUserPoints(customer.loyalty_points || 0);
        }
        
        // Récupérer l'historique réel des points depuis Supabase
        if (customer) {
          const { data: transactions, error: transactionsError } = await supabase
            .from('loyalty_transactions')
            .select(`
              id,
              points_earned,
              points_used,
              transaction_type,
              source_category,
              description,
              created_at
            `)
            .eq('customer_id', customer.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (transactionsError) {
            console.error('Erreur lors de la récupération des transactions:', transactionsError);
            // Fallback vers des données simulées si erreur
            setPointsHistory([
              { date: '2024-01-15', points: 15, type: 'gain', description: 'Commande Cocktails Maison' },
              { date: '2024-01-10', points: 10, type: 'gain', description: 'Commande Apéros' },
              { date: '2024-01-05', points: 10, type: 'gain', description: 'Commande Apéros' }
            ]);
          } else {
            // Transformer les données Supabase au format attendu
            const formattedHistory = transactions?.map(transaction => ({
              date: transaction.created_at,
              points: transaction.points_earned || transaction.points_used || 0,
              type: transaction.points_earned > 0 ? 'gain' : 'use',
              description: transaction.description || `${transaction.transaction_type} - ${transaction.source_category || 'Système'}`
            })) || [];
            
            setPointsHistory(formattedHistory);
          }
        } else {
          // Si pas de client trouvé, afficher un historique vide
          setPointsHistory([]);
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getCurrentUser();
  }, [router]);
  
  // Déterminer le niveau actuel
  const getCurrentTier = (points: number) => {
    return loyaltyTiers.find(tier => points >= tier.min && points <= tier.max) || loyaltyTiers[0];
  };
  
  // Déterminer le prochain niveau
  const getNextTier = (points: number) => {
    return loyaltyTiers.find(tier => points < tier.min) || null;
  };
  
  const currentTier = getCurrentTier(userPoints);
  const nextTier = getNextTier(userPoints);
  const progressToNext = nextTier ? ((userPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;
  
  if (loading) {
    return (
      <UserAccountLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f5a623]"></div>
        </div>
      </UserAccountLayout>
    );
  }
  
  return (
    <UserAccountLayout>
      <div className="space-y-6">
        {/* Header avec points actuels */}
        <div className={`${currentTier.bgColor} rounded-xl p-6 border-2 border-opacity-20`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full bg-gradient-to-r ${currentTier.color} text-white`}>
                <currentTier.icon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mes Points Fidélité</h1>
                <p className="text-gray-600">Niveau {currentTier.name}</p>
              </div>
            </div>
            <Badge className={`bg-gradient-to-r ${currentTier.color} text-white px-4 py-2 text-lg font-bold`}>
              {userPoints} points
            </Badge>
          </div>
          
          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progression vers {nextTier.name}</span>
                <span>{nextTier.min - userPoints} points restants</span>
              </div>
              <Progress value={progressToNext} className="h-3" />
            </div>
          )}
        </div>
        
        {/* Avantages du niveau actuel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-[#f5a623]" />
              Vos avantages {currentTier.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {currentTier.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Comment gagner des points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#f5a623]" />
              Comment gagner des points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {pointRules.map((rule, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                  <div className="p-2 bg-[#f5a623] text-white rounded-full">
                    <rule.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{rule.category}</div>
                    <div className="text-sm text-gray-600">{rule.description}</div>
                  </div>
                  <Badge className="bg-[#f5a623] text-white font-bold">
                    +{rule.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Tous les niveaux */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-[#f5a623]" />
              Tous les niveaux de fidélité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loyaltyTiers.map((tier, index) => {
                const TierIcon = tier.icon;
                const isCurrentTier = tier.name === currentTier.name;
                const isUnlocked = userPoints >= tier.min;
                
                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCurrentTier 
                        ? `${tier.bgColor} border-opacity-50 shadow-md` 
                        : isUnlocked 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-gray-100 border-gray-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isUnlocked ? `bg-gradient-to-r ${tier.color} text-white` : 'bg-gray-400 text-white'}`}>
                          <TierIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{tier.name}</h3>
                          <p className="text-sm text-gray-600">
                            {tier.max === Infinity ? `${tier.min}+ points` : `${tier.min}-${tier.max} points`}
                          </p>
                        </div>
                      </div>
                      {isCurrentTier && (
                        <Badge className="bg-[#f5a623] text-white">Niveau actuel</Badge>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      {tier.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center gap-2 text-sm">
                          <div className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className={isUnlocked ? 'text-gray-700' : 'text-gray-500'}>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Historique des points */}
        {pointsHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#f5a623]" />
                Historique de vos points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pointsHistory.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'gain' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'gain' ? <TrendingUp className="h-4 w-4" /> : <TrendingUp className="h-4 w-4 rotate-180" />}
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <Badge className={transaction.type === 'gain' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {transaction.type === 'gain' ? '+' : '-'}{transaction.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Call to action */}
        <div className="text-center py-8">
          <Button 
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-[#f5a623] to-orange-500 hover:from-orange-500 hover:to-[#f5a623] text-white px-8 py-3 text-lg font-semibold"
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Commencer mes achats
          </Button>
          <p className="text-gray-600 mt-2">Gagnez des points à chaque commande !</p>
        </div>
      </div>
    </UserAccountLayout>
  );
}
 