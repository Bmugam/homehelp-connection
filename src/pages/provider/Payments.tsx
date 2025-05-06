import React, { useState, useEffect } from 'react';
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
  Clock,
  AlertCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { apiService } from '@/services/api';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const ProviderPayments = () => {
  const { user } = useAuth();
  const [filterOpen, setFilterOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    availableBalance: 0,
    totalEarnings: 0,
    pendingPayments: 0,
    pendingCount: 0
  });

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await apiService.providers.getPayments(user.id);
        const paymentsData = response.data;

        // Convert payment.amount to number for each payment
        const paymentsDataWithNumberAmount = paymentsData.map(payment => ({
          ...payment,
          amount: Number(payment.amount)
        }));

        setPayments(paymentsDataWithNumberAmount);

        // Calculate stats
        const total = paymentsDataWithNumberAmount.reduce((sum, payment) => sum + payment.amount, 0);
        const pending = paymentsDataWithNumberAmount
          .filter(payment => payment.status === 'pending')
          .reduce((sum, payment) => sum + payment.amount, 0);
        const pendingCount = paymentsDataWithNumberAmount.filter(payment => payment.status === 'pending').length;

        setStats({
          availableBalance: total - pending,
          totalEarnings: total,
          pendingPayments: pending,
          pendingCount
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  // Filter payments based on search, status, and other filters
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = (
      payment.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.service_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    
    const matchesMethod = paymentMethod === 'all' || payment.payment_method === paymentMethod;

    let matchesDate = true;
    if (dateRange !== 'all') {
      const paymentDate = new Date(payment.created_at);
      const now = new Date();
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);

      if (dateRange === 'this-month') {
        matchesDate = paymentDate >= monthAgo;
      } else if (dateRange === 'last-3-months') {
        matchesDate = paymentDate >= threeMonthsAgo;
      }
    }

    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-homehelp-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-homehelp-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-full inline-block mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

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
              <h3 className="text-2xl font-bold text-homehelp-900">KSH {stats.availableBalance.toFixed(2)}</h3>
              <p className="text-xs text-green-600 mt-1">
                Ready to withdraw
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
              <h3 className="text-2xl font-bold text-homehelp-900">KSH {stats.totalEarnings.toFixed(2)}</h3>
              <p className="text-xs text-green-600 mt-1">
                All time earnings
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
              <h3 className="text-2xl font-bold text-homehelp-900">KSH {stats.pendingPayments.toFixed(2)}</h3>
              <p className="text-xs text-yellow-600 mt-1">
                {stats.pendingCount} transactions pending
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
              <h3 className="text-2xl font-bold text-homehelp-900">KSH 100,000.00</h3>
              <div className="w-full mt-2">
                <Progress value={(stats.totalEarnings / 100000) * 100} className="h-2" />
                <p className="text-xs text-homehelp-600 mt-1">
                  {((stats.totalEarnings / 100000) * 100).toFixed(1)}% achieved
                </p>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <LineChart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs and Search Bar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setSelectedStatus}>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <select 
                  className="w-full p-2 border rounded-md"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="this-month">This Month</option>
                  <option value="last-month">Last Month</option>
                  <option value="last-3-months">Last 3 Months</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-homehelp-700 mb-1 block">Payment Method</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="all">All Methods</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card Payment</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" size="sm" onClick={() => {
                setDateRange('all');
                setPaymentMethod('all');
              }}>Reset</Button>
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
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-homehelp-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-homehelp-900">
                          {`${payment.first_name} ${payment.last_name}`}
                        </div>
                        <div className="text-xs text-homehelp-500">{payment.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-homehelp-700">{payment.service_name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-homehelp-700">
                      <Calendar className="h-4 w-4 mr-1 text-homehelp-400" />
                      {format(new Date(payment.created_at), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-homehelp-700">
                      <CreditCard className="h-4 w-4 mr-1 text-homehelp-400" />
                      {payment.payment_method}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-homehelp-900">
                    KSH {payment.amount.toFixed(2)}
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
                    {payment.mpesa_receipt && (
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Receipt
                      </Button>
                    )}
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
            Showing <span className="font-medium">{filteredPayments.length}</span> of <span className="font-medium">{payments.length}</span> transactions
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
