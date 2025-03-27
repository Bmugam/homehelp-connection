import React from 'react';
import { 
  Users, 
  ShieldCheck, 
  Briefcase, 
  CreditCard 
} from 'lucide-react';

const StatCard = ({ icon, title, value, color }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md flex items-center ${color}`}>
    <div className="mr-4">
      {icon}
    </div>
    <div>
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  // In a real app, these would come from your backend
  const stats = [
    {
      icon: <Users className="w-12 h-12 text-blue-500" />,
      title: 'Total Users',
      value: '1,234',
      color: 'border-l-4 border-blue-500'
    },
    {
      icon: <Briefcase className="w-12 h-12 text-green-500" />,
      title: 'Total Providers',
      value: '456',
      color: 'border-l-4 border-green-500'
    },
    {
      icon: <ShieldCheck className="w-12 h-12 text-purple-500" />,
      title: 'Active Services',
      value: '789',
      color: 'border-l-4 border-purple-500'
    },
    {
      icon: <CreditCard className="w-12 h-12 text-red-500" />,
      title: 'Total Bookings',
      value: '2,345',
      color: 'border-l-4 border-red-500'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard 
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="border-b pb-2">
            <p className="text-gray-600">
              <span className="font-bold">John Doe</span> signed up as a new provider
            </p>
            <span className="text-sm text-gray-400">2 hours ago</span>
          </div>
          <div className="border-b pb-2">
            <p className="text-gray-600">
              <span className="font-bold">New Service</span> added in Health Category
            </p>
            <span className="text-sm text-gray-400">5 hours ago</span>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-bold">System Update</span> Completed successfully
            </p>
            <span className="text-sm text-gray-400">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;