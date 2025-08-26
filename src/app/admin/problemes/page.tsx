'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Problem {
  id: string;
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount: number;
  problem_type: 'livraison' | 'produit' | 'service' | 'paiement' | 'autre';
  problem_description: string;
  urgency_level: 'faible' | 'normale' | 'haute' | 'critique';
  status: 'nouveau' | 'en_cours' | 'resolu' | 'ferme';
  reported_by_customer: boolean;
  admin_notes?: string;
  resolution_notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

const statusColors = {
  nouveau: 'bg-red-100 text-red-800',
  en_cours: 'bg-yellow-100 text-yellow-800',
  resolu: 'bg-green-100 text-green-800',
  ferme: 'bg-gray-100 text-gray-800'
};

const urgencyColors = {
  faible: 'bg-blue-100 text-blue-800',
  normale: 'bg-gray-100 text-gray-800',
  haute: 'bg-orange-100 text-orange-800',
  critique: 'bg-red-100 text-red-800'
};

const problemTypeLabels = {
  livraison: 'Livraison',
  produit: 'Produit',
  service: 'Service',
  paiement: 'Paiement',
  autre: 'Autre'
};

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('problemes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des problèmes:', error);
        return;
      }

      setProblems(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProblemStatus = async (problemId: string, newStatus: string) => {
    try {
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'resolu' || newStatus === 'ferme') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('problemes')
        .update(updateData)
        .eq('id', problemId);

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        return;
      }

      // Refresh the list
      fetchProblems();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = 
      problem.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.problem_description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || problem.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || problem.urgency_level === urgencyFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'nouveau': return <AlertCircle className="h-4 w-4" />;
      case 'en_cours': return <Clock className="h-4 w-4" />;
      case 'resolu': return <CheckCircle className="h-4 w-4" />;
      case 'ferme': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Problèmes</h1>
        <p className="text-gray-600">Gérez et suivez les problèmes signalés sur les commandes</p>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="nouveau">Nouveau</option>
            <option value="en_cours">En cours</option>
            <option value="resolu">Résolu</option>
            <option value="ferme">Fermé</option>
          </select>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Toutes les urgences</option>
            <option value="faible">Faible</option>
            <option value="normale">Normale</option>
            <option value="haute">Haute</option>
            <option value="critique">Critique</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            {filteredProblems.length} problème(s) trouvé(s)
          </div>
        </div>
      </div>

      {/* Liste des problèmes */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredProblems.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun problème trouvé</h3>
            <p className="text-gray-600">Aucun problème ne correspond à vos critères de recherche.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProblems.map((problem) => (
                  <tr key={problem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {problem.order_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {problem.total_amount.toFixed(0)} FCFA
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {problem.customer_name}
                        </div>
                        {problem.customer_phone && (
                          <div className="text-sm text-gray-500">
                            {problem.customer_phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {problemTypeLabels[problem.problem_type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyColors[problem.urgency_level]}`}>
                        {problem.urgency_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(problem.status)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[problem.status]}`}>
                          {problem.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(problem.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProblem(problem);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {problem.status !== 'resolu' && problem.status !== 'ferme' && (
                          <select
                            value={problem.status}
                            onChange={(e) => updateProblemStatus(problem.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="nouveau">Nouveau</option>
                            <option value="en_cours">En cours</option>
                            <option value="resolu">Résolu</option>
                            <option value="ferme">Fermé</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {showModal && selectedProblem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Détails du problème
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Commande</label>
                    <p className="text-sm text-gray-900">{selectedProblem.order_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Montant</label>
                    <p className="text-sm text-gray-900">{selectedProblem.total_amount.toFixed(0)} FCFA</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Client</label>
                    <p className="text-sm text-gray-900">{selectedProblem.customer_name}</p>
                    {selectedProblem.customer_email && (
                      <p className="text-sm text-gray-600">{selectedProblem.customer_email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type de problème</label>
                    <p className="text-sm text-gray-900">{problemTypeLabels[selectedProblem.problem_type]}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Urgence</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyColors[selectedProblem.urgency_level]}`}>
                      {selectedProblem.urgency_level}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <div className="flex items-center">
                      {getStatusIcon(selectedProblem.status)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedProblem.status]}`}>
                        {selectedProblem.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description du problème</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedProblem.problem_description}
                  </p>
                </div>

                {selectedProblem.admin_notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes administrateur</label>
                    <p className="text-sm text-gray-900 bg-yellow-50 p-3 rounded-lg">
                      {selectedProblem.admin_notes}
                    </p>
                  </div>
                )}

                {selectedProblem.resolution_notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes de résolution</label>
                    <p className="text-sm text-gray-900 bg-green-50 p-3 rounded-lg">
                      {selectedProblem.resolution_notes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <label className="block font-medium">Créé le</label>
                    <p>{new Date(selectedProblem.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                  {selectedProblem.resolved_at && (
                    <div>
                      <label className="block font-medium">Résolu le</label>
                      <p>{new Date(selectedProblem.resolved_at).toLocaleString('fr-FR')}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
