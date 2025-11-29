import '../styles/globals.css';
import { useEffect } from 'react';
import { useAuthStore } from '../store/useStore';
import { initSocket } from '../lib/socket';
import { getSessionId } from '../lib/utils';

export default function App({ Component, pageProps }) {
  const { setAuth, user } = useAuthStore();

  useEffect(() => {
    // Initialize session ID for guest users
    getSessionId();

    // Restore auth state from localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuth(user, token);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Initialize socket connection
    const socket = initSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return <Component {...pageProps} />;
}
