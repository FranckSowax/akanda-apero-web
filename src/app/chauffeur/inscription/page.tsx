'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Phone, 
  Mail, 
  Car, 
  CreditCard,
  Eye,
  EyeOff,
  ArrowLeft,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
// import DeliveryService from '../../../services/delivery-service'; // Non utilisé pour l'inscription

export default function InscriptionChauffeur() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    adresse: '',
    ville: '',
    password: '',
    confirmPassword: '',
    type_vehicule: '',
    marque_vehicule: '',
    modele_vehicule: '',
    immatriculation: '',
    permis_conduire: '',
    acceptTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (!formData.acceptTerms) {
      alert('Vous devez accepter les conditions d\'utilisation');
      return;
    }

    setLoading(true);
    try {
      const chauffeurData = {
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        email: formData.email,
        adresse: formData.adresse,
        ville: formData.ville,
        type_vehicule: formData.type_vehicule,
        marque_vehicule: formData.marque_vehicule,
        modele_vehicule: formData.modele_vehicule,
        immatriculation: formData.immatriculation,
        permis_conduire: formData.permis_conduire,
        disponible: false
      };

      const response = await fetch('/api/chauffeurs/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          password: formData.password,
          chauffeurData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setStep(4); // Étape de confirmation
        setTimeout(() => {
          router.push('/chauffeur/connexion');
        }, 3000);
      } else {
        console.error('Erreur inscription:', result);
        alert('Erreur lors de l\'inscription: ' + (result.message || result.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.nom || !formData.telephone || !formData.email)) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (step === 2 && (!formData.password || !formData.confirmPassword)) {
      alert('Veuillez définir un mot de passe');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Informations personnelles</h2>
        <p className="text-gray-600 text-sm">Étape 1 sur 3</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="nom" className="text-base font-medium">Nom complet *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            placeholder="Votre nom complet"
            className="h-12 text-base"
            required
          />
        </div>

        <div>
          <Label htmlFor="telephone" className="text-base font-medium">Téléphone *</Label>
          <Input
            id="telephone"
            type="tel"
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            placeholder="+33 6 12 34 56 78"
            className="h-12 text-base"
            required
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-base font-medium">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="votre.email@exemple.com"
            className="h-12 text-base"
            required
          />
        </div>
      </div>

      <Button 
        onClick={nextStep}
        className="w-full h-12 text-base font-medium"
        size="lg"
      >
        Continuer
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Sécurité</h2>
        <p className="text-gray-600 text-sm">Étape 2 sur 3</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="password" className="text-base font-medium">Mot de passe *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 caractères"
              className="h-12 text-base pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-base font-medium">Confirmer le mot de passe *</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Répétez votre mot de passe"
            className="h-12 text-base"
            required
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <Button 
          onClick={prevStep}
          variant="outline"
          className="flex-1 h-12 text-base"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button 
          onClick={nextStep}
          className="flex-1 h-12 text-base font-medium"
        >
          Continuer
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Car className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Véhicule</h2>
        <p className="text-gray-600 text-sm">Étape 3 sur 3</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="prenom" className="text-base font-medium">Prénom</Label>
          <Input
            id="prenom"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            placeholder="Votre prénom"
            className="h-12 text-base"
            required
          />
        </div>

        <div>
          <Label htmlFor="adresse" className="text-base font-medium">Adresse</Label>
          <Input
            id="adresse"
            value={formData.adresse}
            onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
            placeholder="123 rue de la Paix"
            className="h-12 text-base"
            required
          />
        </div>

        <div>
          <Label htmlFor="ville" className="text-base font-medium">Ville</Label>
          <Input
            id="ville"
            value={formData.ville}
            onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
            placeholder="Paris"
            className="h-12 text-base"
            required
          />
        </div>


        <div>
          <Label htmlFor="permis_conduire" className="text-base font-medium">Numéro de permis</Label>
          <Input
            id="permis_conduire"
            value={formData.permis_conduire}
            onChange={(e) => setFormData({ ...formData, permis_conduire: e.target.value })}
            placeholder="123456789"
            className="h-12 text-base"
            required
          />
        </div>

        <div>
          <Label htmlFor="type_vehicule" className="text-base font-medium">Type de véhicule</Label>
          <Select value={formData.type_vehicule} onValueChange={(value) => setFormData({ ...formData, type_vehicule: value })}>
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Sélectionner votre véhicule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="moto">🏍️ Moto</SelectItem>
              <SelectItem value="scooter">🛵 Scooter</SelectItem>
              <SelectItem value="voiture">🚗 Voiture</SelectItem>
              <SelectItem value="camionnette">🚐 Camionnette</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="marque_vehicule" className="text-base font-medium">Marque</Label>
            <Input
              id="marque_vehicule"
              value={formData.marque_vehicule}
              onChange={(e) => setFormData({ ...formData, marque_vehicule: e.target.value })}
              placeholder="Toyota"
              className="h-12 text-base"
              required
            />
          </div>
          <div>
            <Label htmlFor="modele_vehicule" className="text-base font-medium">Modèle</Label>
            <Input
              id="modele_vehicule"
              value={formData.modele_vehicule}
              onChange={(e) => setFormData({ ...formData, modele_vehicule: e.target.value })}
              placeholder="Corolla"
              className="h-12 text-base"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="immatriculation" className="text-base font-medium">Plaque d'immatriculation</Label>
          <Input
            id="immatriculation"
            value={formData.immatriculation}
            onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value.toUpperCase() })}
            placeholder="AB-123-CD"
            className="h-12 text-base"
            required
          />
        </div>

        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={formData.acceptTerms}
            onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
            className="mt-1"
          />
          <Label htmlFor="acceptTerms" className="text-sm text-gray-700 leading-relaxed">
            J'accepte les conditions d'utilisation et la politique de confidentialité d'Akanda Apéro
          </Label>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button 
          onClick={prevStep}
          variant="outline"
          className="flex-1 h-12 text-base"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 h-12 text-base font-medium"
        >
          {loading ? 'Inscription...' : 'S\'inscrire'}
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-10 h-10 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscription réussie !</h2>
        <p className="text-gray-600">
          Votre compte chauffeur a été créé avec succès. Vous allez être redirigé vers la page de connexion.
        </p>
      </div>
      <div className="animate-pulse">
        <div className="h-2 bg-blue-200 rounded-full">
          <div className="h-2 bg-blue-600 rounded-full w-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Car className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Akanda Apéro
            </CardTitle>
            <p className="text-gray-600">Rejoignez notre équipe de chauffeurs</p>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Déjà inscrit ?{' '}
            <button
              onClick={() => router.push('/chauffeur/connexion')}
              className="text-blue-600 font-medium hover:underline"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
