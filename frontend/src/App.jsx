import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch notifications (placeholder - implement as needed)
  useEffect(() => {
    // TODO: Implement notification fetching
    // const fetchNotifications = async () => {
    //   const data = await notificationService.getUnread();
    //   setNotifications(data);
    // };
    // fetchNotifications();
  }, []);

  return (
    <Layout 
      user={user}
      notifications={notifications}
      onLogout={handleLogout}
    >
      <AppRoutes />
    </Layout>
  );
}

export default App;
