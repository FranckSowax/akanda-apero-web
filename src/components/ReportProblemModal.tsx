'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Send } from 'lucide-react';
import { supabase } from '../lib/supabase/client';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount: number;
}

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSuccess?: () => void;
}

const problemTypes = [
  { value: 'livraison', label: 'Problème de livraison' },
  { value: 'produit', label: 'Problème de produit' },
  { value: 'service', label: 'Problème de service' },
  { value: 'paiement', label: 'Problème de paiement' },
  { value: 'autre', label: 'Autre problème' }
];

const urgencyLevels = [
  { value: 'faible', label: 'Faible', description: 'Problème mineur, pas urgent' },
  { value: 'normale', label: 'Normale', description: 'Problème standard' },
  { value: 'haute', label: 'Haute', description: 'Problème important, nécessite attention' },
  { value: 'critique', label: 'Critique', description: 'Problème urgent, action immédiate requise' }
];

export default function ReportProblemModal({ 
  isOpen, 
  onClose, 
  order, 
  onSuccess 
}: ReportProblemModalProps) {
  const [formData, setFormData] = useState({
    problem_type: '',
    problem_description: '',
    urgency_level: 'normale',
    reported_by_customer: false,
    admin_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.problem_type || !formData.problem_description.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const problemData = {
        order_id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_email: order.customer_email || null,
        customer_phone: order.customer_phone || null,
        total_amount: order.total_amount,
        problem_type: formData.problem_type,
        problem_description: formData.problem_description.trim(),
        urgency_level: formData.urgency_level,
        reported_by_customer: formData.reported_by_customer,
        admin_notes: formData.admin_notes.trim() || null,
        status: 'nouveau'
      };

      const { error: insertError } = await supabase
        .from('problemes')
        .insert([problemData]);

      if (insertError) {
        console.error('Erreur lors de la création du problème:', insertError);
        setError('Erreur lors de la création du signalement. Veuillez réessayer.');
        return;
      }

      // Reset form
      setFormData({
        problem_type: '',
        problem_description: '',
        urgency_level: 'normale',
        reported_by_customer: false,
        admin_notes: ''
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      setError('Une erreur inattendue s\'est produite. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Signaler un problème
                </h2>
                <p className="text-sm text-gray-600">
                  Commande #{order.order_number} - {order.customer_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Problem Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de problème <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.problem_type}
                onChange={(e) => handleChange('problem_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={loading}
              >
                <option value="">Sélectionnez un type de problème</option>
                {problemTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau d'urgence
              </label>
              <div className="space-y-2">
                {urgencyLevels.map((level) => (
                  <label key={level.value} className="flex items-start">
                    <input
                      type="radio"
                      name="urgency_level"
                      value={level.value}
                      checked={formData.urgency_level === level.value}
                      onChange={(e) => handleChange('urgency_level', e.target.value)}
                      className="mt-1 mr-3 text-orange-500 focus:ring-orange-500"
                      disabled={loading}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{level.label}</div>
                      <div className="text-sm text-gray-600">{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Problem Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description du problème <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.problem_description}
                onChange={(e) => handleChange('problem_description', e.target.value)}
                placeholder="Décrivez en détail le problème rencontré..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Soyez aussi précis que possible pour nous aider à résoudre le problème rapidement.
              </p>
            </div>

            {/* Reported by customer checkbox */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.reported_by_customer}
                  onChange={(e) => handleChange('reported_by_customer', e.target.checked)}
                  className="mt-1 mr-3 text-orange-500 focus:ring-orange-500"
                  disabled={loading}
                />
                <div>
                  <div className="font-medium text-gray-900">Signalé par le client</div>
                  <div className="text-sm text-gray-600">
                    Cochez cette case si le problème a été signalé directement par le client
                  </div>
                </div>
              </label>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes administrateur (optionnel)
              </label>
              <textarea
                value={formData.admin_notes}
                onChange={(e) => handleChange('admin_notes', e.target.value)}
                placeholder="Notes internes, actions déjà prises, etc..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                disabled={loading}
              />
            </div>

            {/* Order Info Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Informations de la commande</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Numéro:</span>
                  <span className="ml-2 font-medium">{order.order_number}</span>
                </div>
                <div>
                  <span className="text-gray-600">Montant:</span>
                  <span className="ml-2 font-medium">{order.total_amount.toFixed(0)} FCFA</span>
                </div>
                <div>
                  <span className="text-gray-600">Client:</span>
                  <span className="ml-2 font-medium">{order.customer_name}</span>
                </div>
                {order.customer_email && (
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{order.customer_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signalement...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Signaler le problème
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
