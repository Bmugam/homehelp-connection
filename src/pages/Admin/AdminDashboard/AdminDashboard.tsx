import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../config/config';

const AdminDashboard = () => {
  const [recentUsers, setRecentUsers] = useState([]);
  const [error, setError] = useState('');

  const fetchRecentUsers = async () => {
    console.log('Fetching recent users...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/recent-users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Recent users fetch error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch recent users');
      }

      const data = await response.json();
      console.log('Recent users fetched successfully:', data.length);
      setRecentUsers(data);
    } catch (error) {
      console.error('Error fetching recent users:', error);
      setError('Failed to fetch recent users');
    }
  };

  useEffect(() => {
    fetchRecentUsers();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {error && <p className="error">{error}</p>}
      <ul>
        {recentUsers.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;