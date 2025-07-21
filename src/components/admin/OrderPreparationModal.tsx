'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  Circle,
  ChefHat,
  Package,
  AlertTriangle,
  Timer,
  Users,
  Utensils,
  BookOpen,
  CheckSquare,
  Square
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Order, CocktailMaison, Mocktail, CocktailIngredient, MocktailIngredient, CocktailInstruction } from '../../types/supabase';
import { supabase } from '../../lib/supabase/client';

interface OrderPreparationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (orderId: string, status: string) => void;
}

interface PreparationItem {
  id: string;
  name: string;
  quantity: number;
  type: 'cocktail' | 'mocktail' | 'product';
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
    is_optional?: boolean;
  }>;
  instructions: Array<{
    step_number: number;
    instruction: string;
  }>;
  preparation_time?: number;
  difficulty_level?: number;
}

interface TaskItem {
  id: string;
  task: string;
  category: 'preparation' | 'assembly' | 'packaging' | 'quality_check';
  completed: boolean;
  estimated_time?: number;
}

const OrderPreparationModal: React.FC<OrderPreparationModalProps> = ({ 
  order, 
  isOpen, 
  onClose, 
  onStatusUpdate 
}) => {
  const [preparationItems, setPreparationItems] = useState<PreparationItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPreparationTime, setTotalPreparationTime] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  // Charger les détails de préparation
  useEffect(() => {
    if (order && isOpen) {
      loadPreparationDetails();
      generatePreparationTasks();
    }
  }, [order, isOpen]);

  const loadPreparationDetails = async () => {
    if (!order?.order_items) return;
    
    setLoading(true);
    const items: PreparationItem[] = [];
    let totalTime = 0;

    try {
      for (const orderItem of order.order_items) {
        const productName = orderItem.products?.name || orderItem.product_name || '';
        
        // Vérifier si c'est un cocktail
        const { data: cocktail } = await supabase
          .from('cocktails_maison')
          .select(`
            *,
            cocktail_ingredients(*),
            cocktail_instructions(*)
          `)
          .eq('name', productName)
          .single();

        if (cocktail) {
          const prepItem: PreparationItem = {
            id: `cocktail-${cocktail.id}`,
            name: cocktail.name,
            quantity: orderItem.quantity || 1,
            type: 'cocktail',
            ingredients: cocktail.cocktail_ingredients?.map((ing: CocktailIngredient) => ({
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              is_optional: ing.is_optional
            })) || [],
            instructions: cocktail.cocktail_instructions?.sort((a, b) => a.step_number - b.step_number).map((inst: CocktailInstruction) => ({
              step_number: inst.step_number,
              instruction: inst.instruction
            })) || [],
            preparation_time: cocktail.preparation_time_minutes,
            difficulty_level: cocktail.difficulty_level
          };
          items.push(prepItem);
          totalTime += (cocktail.preparation_time_minutes || 5) * (orderItem.quantity || 1);
          continue;
        }

        // Vérifier si c'est un mocktail
        const { data: mocktail } = await supabase
          .from('mocktails')
          .select(`
            *,
            mocktail_ingredients(*)
          `)
          .eq('name', productName)
          .single();

        if (mocktail) {
          const prepItem: PreparationItem = {
            id: `mocktail-${mocktail.id}`,
            name: mocktail.name,
            quantity: orderItem.quantity || 1,
            type: 'mocktail',
            ingredients: mocktail.mocktail_ingredients?.map((ing: MocktailIngredient) => ({
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit
            })) || [],
            instructions: mocktail.recipe ? [
              { step_number: 1, instruction: mocktail.recipe }
            ] : [],
            preparation_time: mocktail.preparation_time_minutes,
            difficulty_level: mocktail.difficulty_level
          };
          items.push(prepItem);
          totalTime += (mocktail.preparation_time_minutes || 3) * (orderItem.quantity || 1);
          continue;
        }

        // Produit standard (sans préparation spéciale)
        const prepItem: PreparationItem = {
          id: `product-${orderItem.id}`,
          name: productName,
          quantity: orderItem.quantity || 1,
          type: 'product',
          ingredients: [],
          instructions: [
            { step_number: 1, instruction: `Préparer ${orderItem.quantity || 1} × ${productName}` }
          ],
          preparation_time: 2
        };
        items.push(prepItem);
        totalTime += 2 * (orderItem.quantity || 1);
      }

      setPreparationItems(items);
      setTotalPreparationTime(totalTime);
    } catch (error) {
      console.error('Erreur lors du chargement des détails de préparation:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePreparationTasks = () => {
    if (!order) return;

    const taskList: TaskItem[] = [
      {
        id: 'verify-order',
        task: 'Vérifier les détails de la commande',
        category: 'preparation',
        completed: false,
        estimated_time: 1
      },
      {
        id: 'gather-ingredients',
        task: 'Rassembler tous les ingrédients nécessaires',
        category: 'preparation',
        completed: false,
        estimated_time: 3
      },
      {
        id: 'prepare-workspace',
        task: 'Préparer l\'espace de travail et les ustensiles',
        category: 'preparation',
        completed: false,
        estimated_time: 2
      },
      {
        id: 'prepare-cocktails',
        task: 'Préparer les cocktails/mocktails selon les recettes',
        category: 'assembly',
        completed: false,
        estimated_time: totalPreparationTime
      },
      {
        id: 'package-products',
        task: 'Emballer les produits supplémentaires',
        category: 'packaging',
        completed: false,
        estimated_time: 2
      },
      {
        id: 'quality-check',
        task: 'Vérification qualité et présentation',
        category: 'quality_check',
        completed: false,
        estimated_time: 2
      },
      {
        id: 'final-packaging',
        task: 'Emballage final et étiquetage',
        category: 'packaging',
        completed: false,
        estimated_time: 3
      }
    ];

    setTasks(taskList);
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => {
      const updated = prev.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      setCompletedTasks(updated.filter(t => t.completed).length);
      return updated;
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'preparation': return <ChefHat className="h-4 w-4" />;
      case 'assembly': return <Utensils className="h-4 w-4" />;
      case 'packaging': return <Package className="h-4 w-4" />;
      case 'quality_check': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'preparation': return 'bg-blue-100 text-blue-800';
      case 'assembly': return 'bg-purple-100 text-purple-800';
      case 'packaging': return 'bg-green-100 text-green-800';
      case 'quality_check': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyBadge = (level?: number) => {
    if (!level) return null;
    
    const difficulty = level <= 2 ? 'Facile' : level <= 4 ? 'Moyen' : 'Difficile';
    const color = level <= 2 ? 'bg-green-100 text-green-800' : 
                  level <= 4 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
    
    return <Badge className={color}>{difficulty}</Badge>;
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (order && onStatusUpdate) {
      onStatusUpdate(order.id, newStatus);
    }
  };

  if (!isOpen || !order) return null;

  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#f5a623] to-[#e8941a] text-white">
          <div className="flex items-center gap-4">
            <ChefHat className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Préparation Commande</h2>
              <p className="text-sm opacity-90">
                #{order.order_number || order.id?.slice(0, 8)} • {order.customers?.first_name} {order.customers?.last_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm opacity-90">Temps estimé</p>
              <p className="font-semibold flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {totalPreparationTime} min
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Sidebar - Liste des tâches */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Checklist ({completedTasks}/{tasks.length})
                </h3>
                <div className="text-sm text-gray-600">
                  {Math.round(progressPercentage)}%
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-[#f5a623] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      task.completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200 hover:border-[#f5a623]'
                    }`}
                    onClick={() => toggleTask(task.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          task.completed ? 'text-green-800 line-through' : 'text-gray-900'
                        }`}>
                          {task.task}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${getCategoryColor(task.category)}`}>
                            {getCategoryIcon(task.category)}
                            <span className="ml-1">
                              {task.category === 'preparation' ? 'Préparation' :
                               task.category === 'assembly' ? 'Assemblage' :
                               task.category === 'packaging' ? 'Emballage' : 'Contrôle'}
                            </span>
                          </Badge>
                          {task.estimated_time && (
                            <span className="text-xs text-gray-500">
                              {task.estimated_time} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions rapides */}
              <div className="mt-6 space-y-2">
                <Button
                  size="sm"
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  onClick={() => handleStatusUpdate('En préparation')}
                >
                  Marquer "En préparation"
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => handleStatusUpdate('Prête')}
                >
                  Marquer "Prête"
                </Button>
              </div>
            </div>
          </div>

          {/* Contenu principal - Détails de préparation */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f5a623]"></div>
                  <span className="ml-3 text-gray-600">Chargement des détails...</span>
                </div>
              ) : (
                <>
                  {/* Résumé de la commande */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Package className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Résumé de la commande</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Articles</p>
                        <p className="font-medium">{order.order_items?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total</p>
                        <p className="font-medium text-[#f5a623]">
                          {(order.total_amount || 0).toLocaleString()} XAF
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Client</p>
                        <p className="font-medium">
                          {order.customers?.first_name} {order.customers?.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Livraison</p>
                        <p className="font-medium text-xs">
                          {order.delivery_address?.substring(0, 30)}...
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Détails de préparation par item */}
                  {preparationItems.map((item, index) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#f5a623] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900">
                              {item.name} × {item.quantity}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={
                                item.type === 'cocktail' ? 'bg-red-100 text-red-800' :
                                item.type === 'mocktail' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {item.type === 'cocktail' ? 'Cocktail' :
                                 item.type === 'mocktail' ? 'Mocktail' : 'Produit'}
                              </Badge>
                              {getDifficultyBadge(item.difficulty_level)}
                              {item.preparation_time && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  <Timer className="h-3 w-3 mr-1" />
                                  {item.preparation_time * item.quantity} min
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Ingrédients */}
                        {item.ingredients.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                              <Utensils className="h-4 w-4" />
                              Ingrédients requis
                            </h5>
                            <div className="space-y-2">
                              {item.ingredients.map((ingredient, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">
                                      {ingredient.name}
                                    </span>
                                    {ingredient.is_optional && (
                                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                        Optionnel
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {(parseFloat(ingredient.quantity) * item.quantity).toString()} {ingredient.unit}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Instructions */}
                        {item.instructions.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              Instructions de préparation
                            </h5>
                            <div className="space-y-3">
                              {item.instructions.map((instruction, idx) => (
                                <div key={idx} className="flex gap-3">
                                  <div className="bg-[#f5a623] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                    {instruction.step_number}
                                  </div>
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {instruction.instruction}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Alertes spéciales */}
                      {item.type === 'cocktail' && item.difficulty_level && item.difficulty_level > 3 && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <p className="text-sm text-amber-800 font-medium">
                              Attention : Préparation complexe - Vérifier chaque étape avec soin
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Notes de livraison */}
                  {order.delivery_notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        Notes importantes
                      </h3>
                      <p className="text-sm text-gray-700">{order.delivery_notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Préparé par: [Nom employé]</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Temps total estimé: {totalPreparationTime} min</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button 
              className="bg-[#f5a623] hover:bg-[#e8941a]"
              onClick={() => {
                if (completedTasks === tasks.length) {
                  handleStatusUpdate('Prête');
                  onClose();
                } else {
                  handleStatusUpdate('En préparation');
                }
              }}
            >
              {completedTasks === tasks.length ? 'Marquer comme Prête' : 'Commencer la préparation'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPreparationModal;
