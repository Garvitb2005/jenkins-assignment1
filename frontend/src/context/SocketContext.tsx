import React, { createContext, useContext, useEffect, useRef } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from './AuthContext';

interface SocketContextType {
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ connected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [connected, setConnected] = React.useState(false);
  const hasConnected = useRef(false);
  const hasRequestedPermission = useRef(false);

  const requestNotificationPermission = async () => {
    if (hasRequestedPermission.current) return;
    hasRequestedPermission.current = true;

    try {
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
      }

      if (Notification.permission === 'granted' || Notification.permission === 'denied') {
        return;
      }

      await Notification.requestPermission();
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        if (user?._id && !hasConnected.current) {
          await requestNotificationPermission();
          await socketService.connect(user._id);
          setConnected(true);
          hasConnected.current = true;
        } else if (!user?._id && connected) {
          socketService.disconnect();
          setConnected(false);
          hasConnected.current = false;
        }
      } catch (error) {
        console.error('Error initializing socket:', error);
        setConnected(false);
        hasConnected.current = false;
      }
    };

    initializeSocket();

    return () => {
      if (connected) {
        socketService.disconnect();
        setConnected(false);
        hasConnected.current = false;
      }
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ connected }}>
      {children}
    </SocketContext.Provider>
  );
};
