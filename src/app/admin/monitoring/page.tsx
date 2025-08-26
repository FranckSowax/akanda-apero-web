'use client';

import React from 'react';
import MonitoringDashboard from '../../../components/admin/MonitoringDashboard';

export default function MonitoringPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Monitoring & Analytics
        </h1>
        <p className="text-gray-600">
          Surveillez les performances, erreurs et métriques business de votre application en temps réel.
        </p>
      </div>
      
      <MonitoringDashboard />
    </div>
  );
}
