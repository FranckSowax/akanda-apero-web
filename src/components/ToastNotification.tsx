'use client';

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Toast } from './ui/toast';

const ToastNotification: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { toast } = state.ui;

  const handleClose = () => {
    dispatch({ type: 'HIDE_TOAST' });
  };

  return (
    <Toast 
      visible={!!toast.message} 
      onClose={handleClose}
      variant={toast.type || 'default'}
    >
      {toast.message}
    </Toast>
  );
};

export default ToastNotification;
