// src/components/common/Toast.jsx
import toast, { Toaster } from 'react-hot-toast';

export const showNotification = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  loading: (message) => toast.loading(message),
  info: (message) => toast(message),
};

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '10px',
        },
        success: {
          style: { background: '#28a745', color: '#fff' },
        },
        error: {
          style: { background: '#dc3545', color: '#fff' },
        },
      }}
    />
  );
}