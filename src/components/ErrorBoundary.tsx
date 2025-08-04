'use client';

import React from 'react';
import { useMonitoring } from './MonitoringProvider';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private trackError?: (error: Error, severity: 'low' | 'medium' | 'high' | 'critical') => void;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Tracker l'erreur si possible
    if (this.trackError) {
      this.trackError(error, 'high');
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">Une erreur s'est produite</h3>
              <p className="mt-2 text-sm text-gray-500">
                Nous nous excusons pour ce problème. L'erreur a été signalée et sera corrigée rapidement.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 w-full bg-[#f5a623] hover:bg-[#e09000] text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Recharger la page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC pour injecter le monitoring
export default function ErrorBoundaryWithMonitoring(props: ErrorBoundaryProps) {
  const { trackError } = useMonitoring();
  
  return React.createElement(ErrorBoundary, {
    ...props,
    ref: (ref: any) => {
      if (ref) {
        ref.trackError = trackError;
      }
    }
  });
}
