import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  ArrowDownUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  Download,
  FileText,
  Filter,
  Search,
  ChevronDown,
  MoreHorizontal,
  DollarSign,
  Banknote,
  Wallet,
  LineChart,
  Clock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

import { Link } from 'react-router-dom';

const ProviderPayments = () => {
  const { user } = useAuth();
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Dummy data for payments
  const payments = [
    {
      id: "PAY-8761",
      client: "James Wilson",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      service: "Plumbing Repair",
      date: "Apr 14, 2023",
      amount: 150.00,
      status: "completed",
      method: "Credit Card"
    },
    {
      id: "PAY-8752",
      client: "Maria Johnson",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      service: "Electrical Work",
      date: "Apr 10, 2023",
      amount: 220.00,
      status: "pending",
      method: "Bank Transfer"
    },
    {
      id: "PAY-8743",
      client: "Robert Smith",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      service: "House Cleaning",
      date: "Apr 5, 2023",
      amount: 85.00,
      status: "completed",
      method: "Mobile Payment"
    },
    {
      id: "PAY-8734",
      client: "Sarah Thompson",
      avatar: "https://randomuser.me/api/portraits/women/23.jpg",
      service: "Bathroom Renovation",
      date: "Mar 28, 2023",
      amount: 450.00,
      status: "failed",
      method: "Credit Card"
    },
    {
      id: "PAY-8725",
      client: "Michael Brown",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      service: "Garden Maintenance",
      date: "Mar 20, 2023",
      amount: 120.00,
      status: "completed",
      method: "Cash"
    }
  ];

  // Monthly data for chart
  const monthlyData = [
    { month: "Jan", amount: 850 },
    { month: "Feb", amount: 1200 },
    { month: "Mar", amount: 1450 },
    { month: "Apr", amount: 1025 },
  ];

  return (
    <div>
  
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-homehelp-900">Payments</h1>
          <p className="text-homehelp-600">Manage your earnings and transactions</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="hidden sm:flex">
            <FileText className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Wallet className="mr-2 h-4 w-4" />
            Withdraw Funds
          </Button>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-homehelp-600 text-sm mb-1">Available Balance</p>
              <h3 className="text-2xl font-bold text-homehelp-900">$2,450.75</h3>
              <p className="text-xs text-green-600 mt-1">
                +$450 this month
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-homehelp-600 text-sm mb-1">Total Earnings</p>
              <h3 className="text-2xl font-bold text-homehelp-900">$12,450.00</h3>
              <p className="text-xs text-green-600 mt-1">
                +15% from last month
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Banknote className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-homehelp-600 text-sm mb-1">Pending Payments</p>
              <h3 className="text-2xl font-bold text-homehelp-900">$520.00</h3>
              <p className="text-xs text-yellow-600 mt-1">
                3 transactions
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-homehelp-600 text-sm mb-1">Monthly Goal</p>
              <h3 className="text-2xl font-bold text-homehelp-900">$5,000.00</h3>
              <div className="w-full mt-2">
                <Progress value={68} className="h-2" />
                <p className="text-xs text-homehelp-600 mt-1">
                  68% achieved
                </p>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <LineChart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="p-5 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-homehelp-900">Monthly Revenue</h2>
          <select className="p-2 border rounded-md text-sm">
            <option value="last3months">Last 3 Months</option>
            <option value="last6months">Last 6 Months</option>
            <option value="lastyear">Last Year</option>
          </select>
        </div>
        
        <div className="h-64">
          {/* This would be a chart in a real implementation */}
          <div className="h-full flex items-end justify-around pb-6 pt-4">
            {monthlyData.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="bg-homehelp-600 w-16 rounded-t-md" 
                  style={{ height: `${(item.amount / 1500) * 100}%` }}
                ></div>
                <div className="text-xs mt-2 text-homehelp-600">{item.month}</div>
                <div className="text-sm font-medium text-homehelp-900">${item.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Tabs and Search Bar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Tabs defaultValue="all" className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-homehelp-500 h-4 w-4" />
              <Input 
                placeholder="Search payments..." 
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {filterOpen && (
          <Card className="mt-4 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-homehelp-700 mb-1 block">Date Range</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">All Time</option>
                  <option value="this-month">This Month</option>
                  <option value="last-month">Last Month</option>
                  <option value="last-3-months">Last 3 Months</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-homehelp-700 mb-1 block">Payment Method</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">All Methods</option>
                  <option value="credit-card">Credit Card</option>
                  <option value="bank-transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-homehelp-700 mb-1 block">Amount Range</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">Any Amount</option>
                  <option value="under-100">Under $100</option>
                  <option value="100-500">$100 - $500</option>
                  <option value="over-500">Over $500</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-homehelp-700 mb-1 block">Service Type</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">All Services</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" size="sm">Reset</Button>
              <Button size="sm">Apply Filters</Button>
            </div>
          </Card>
        )}
      </div>

      {/* Transactions Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-homehelp-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-homehelp-600 uppercase tracking-wider">
                  <div className="flex items-center">
                    ID/Client
                    <ArrowDownUp className="ml-1 h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-homehelp-600 uppercase tracking-wider">
                  <div className="flex items-center">
                    Service
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-homehelp-600 uppercase tracking-wider">
                  <div className="flex items-center">
                    Date
                    <ArrowDownUp className="ml-1 h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-homehelp-600 uppercase tracking-wider">
                  <div className="flex items-center">
                    Payment Method
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-homehelp-600 uppercase tracking-wider">
                  <div className="flex items-center">
                    Amount
                    <ArrowDownUp className="ml-1 h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-homehelp-600 uppercase tracking-wider">
                  <div className="flex items-center">
                    Status
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-homehelp-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-homehelp-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-homehelp-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                        <img 
                          src={payment.avatar} 
                          alt={payment.client}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-homehelp-900">{payment.client}</div>
                        <div className="text-xs text-homehelp-500">{payment.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-homehelp-700">{payment.service}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-homehelp-700">
                      <Calendar className="h-4 w-4 mr-1 text-homehelp-400" />
                      {payment.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-homehelp-700">
                      <CreditCard className="h-4 w-4 mr-1 text-homehelp-400" />
                      {payment.method}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-homehelp-900">
                    ${payment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === "completed" 
                        ? "bg-green-100 text-green-800" 
                        : payment.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}>
                      {payment.status === "completed" && (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      )}
                      {payment.status === "pending" && (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {payment.status === "failed" && (
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                      )}
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Receipt
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-white border-t border-homehelp-100 flex justify-between items-center">
          <div className="text-sm text-homehelp-600">
            Showing <span className="font-medium">5</span> of <span className="font-medium">25</span> transactions
          </div>
          <div className="flex space-x-1">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="bg-homehelp-100">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProviderPayments;
