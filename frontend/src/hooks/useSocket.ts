import { useEffect } from 'react';
import { socketService } from '../services/socketService';

export const useSocket = () => {
  useEffect(() => {
    const connectSocket = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user._id) {
            console.log('Connecting socket from hook with user ID:', user._id);
            socketService.connect(user._id.toString());
          }
        }
      } catch (error) {
        console.error('Error connecting socket:', error);
      }
    };

    // Connect socket when component mounts
    connectSocket();

    // Listen for storage events (in case user logs in in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        connectSocket();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      socketService.disconnect();
    };
  }, []);
};
