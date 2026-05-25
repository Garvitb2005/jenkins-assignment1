import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private userId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private connectionPromise: Promise<void> | null = null;
  private isConnecting: boolean = false;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  private setupSocketListeners(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      // Set a connection timeout
      const timeout = setTimeout(() => {
        reject(new Error('Socket connection timeout'));
      }, 10000);

      // Only set up listeners if they haven't been set up already
      if (!this.socket.hasListeners('connect')) {
        this.socket.on('connect', () => {
          console.log('Socket connected successfully. Socket ID:', this.socket?.id);
          this.reconnectAttempts = 0;
          clearTimeout(timeout);
          
          // Register user after connection
          if (this.userId) {
            console.log('Registering user with ID:', this.userId);
            this.socket?.emit('register_user', { userId: this.userId });
          }
          resolve();
        });

        this.socket.on('connection_success', (data) => {
          console.log('Received connection success:', data);
          resolve();
        });

        this.socket.on('registration_success', (data) => {
          console.log('Registration success:', data);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          reject(error);
        });

        this.socket.on('new_assignment', (data) => {
          console.log('Received new assignment notification:', data);
          
          // Show browser notification if permission is granted
          if (Notification.permission === 'granted') {
            try {
              const notification = new Notification('New Assignment', {
                body: `A new assignment "${data.title}" has been posted`,
                icon: '/logo192.png',
                tag: 'new-assignment',
                requireInteraction: true,
                vibrate: [200, 100, 200]
              });

              notification.onclick = () => {
                window.focus();
                notification.close();
              };

              console.log('Browser notification sent successfully');
            } catch (error) {
              console.error('Error showing browser notification:', error);
            }
          } else {
            console.log('Notification permission not granted');
          }
          
          // Always show toast notification
          toast.success(`New assignment posted: ${data.title}`, {
            duration: 5000,
            icon: '📝'
          });
        });

        this.socket.on('disconnect', () => {
          console.log('Socket disconnected');
          this.handleReconnect();
        });

        this.socket.on('error', (error) => {
          console.error('Socket error:', error);
          reject(error);
        });
      }

      // If socket is already connected, resolve immediately
      if (this.socket.connected) {
        clearTimeout(timeout);
        resolve();
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnect attempt ${this.reconnectAttempts} of ${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        if (this.userId) {
          this.connect(this.userId);
        }
      }, 5000);
    } else {
      console.log('Max reconnection attempts reached');
    }
  }

  async connect(userId: string): Promise<void> {
    // If already connecting, return existing promise
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    // If already connected to the same user, return
    if (this.socket?.connected && this.userId === userId) {
      return Promise.resolve();
    }

    this.isConnecting = true;
    this.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        this.userId = userId;
        console.log('Attempting to connect socket with userId:', userId);
        
        // Disconnect existing socket if any
        if (this.socket) {
          console.log('Disconnecting existing socket');
          this.socket.disconnect();
          this.socket = null;
        }

        // Create new socket connection
        this.socket = io('ws://localhost:8000', {
          query: { userId },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
          auth: { userId }
        });

        await this.setupSocketListeners();
        resolve();
      } catch (error) {
        console.error('Error initializing socket:', error);
        reject(error);
      } finally {
        this.isConnecting = false;
        this.connectionPromise = null;
      }
    });

    return this.connectionPromise;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.reconnectAttempts = 0;
      this.connectionPromise = null;
      this.isConnecting = false;
    }
  }
}

export const socketService = SocketService.getInstance();
