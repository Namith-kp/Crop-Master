'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Leaf, 
  MapPin, 
  TrendingUp, 
  Users, 
  Calendar,
  ArrowRight,
  Plus,
  Activity,
  Target,
  Zap,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalEstimations: number;
  thisMonthEstimations: number;
  averageYield: number;
  topCrop: string;
  totalValue: number;
  accuracy: number;
}

interface RecentEstimation {
  id: string;
  cropType: string;
  estimatedYield: number;
  estimatedTotalValue: number;
  createdAt: string;
  accuracy: number;
}

const mockStats: DashboardStats = {
  totalEstimations: 156,
  thisMonthEstimations: 23,
  averageYield: 2450,
  topCrop: 'Wheat',
  totalValue: 1250000,
  accuracy: 87,
};

const mockRecentEstimations: RecentEstimation[] = [
  {
    id: '1',
    cropType: 'Wheat',
    estimatedYield: 2800,
    estimatedTotalValue: 56000,
    createdAt: '2024-01-15',
    accuracy: 89,
  },
  {
    id: '2',
    cropType: 'Rice',
    estimatedYield: 3200,
    estimatedTotalValue: 64000,
    createdAt: '2024-01-14',
    accuracy: 92,
  },
  {
    id: '3',
    cropType: 'Corn',
    estimatedYield: 2100,
    estimatedTotalValue: 42000,
    createdAt: '2024-01-13',
    accuracy: 85,
  },
];

const yieldData = [
  { month: 'Jan', wheat: 2800, rice: 3200, corn: 2100 },
  { month: 'Feb', wheat: 2900, rice: 3100, corn: 2200 },
  { month: 'Mar', wheat: 3000, rice: 3300, corn: 2300 },
  { month: 'Apr', wheat: 3100, rice: 3400, corn: 2400 },
  { month: 'May', wheat: 3200, rice: 3500, corn: 2500 },
  { month: 'Jun', wheat: 3300, rice: 3600, corn: 2600 },
];

const cropDistribution = [
  { name: 'Wheat', value: 35, color: '#10b981' },
  { name: 'Rice', value: 30, color: '#3b82f6' },
  { name: 'Corn', value: 20, color: '#f59e0b' },
  { name: 'Others', value: 15, color: '#8b5cf6' },
];

export function Dashboard() {
  const { state } = useApp();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [recentEstimations, setRecentEstimations] = useState<RecentEstimation[]>(mockRecentEstimations);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');

  const quickActions = [
    {
      title: 'New Estimation',
      description: 'Estimate crop yield',
      icon: Plus,
      href: '/home/crop_yield',
      color: 'bg-blue-500',
    },
    {
      title: 'Crop Recommendation',
      description: 'Get crop suggestions',
      icon: Leaf,
      href: '/home/croprecommendation',
      color: 'bg-green-500',
    },
    {
      title: 'Soil Analysis',
      description: 'Analyze soil data',
      icon: MapPin,
      href: '/home/soildata',
      color: 'bg-purple-500',
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {state.user?.displayName || 'Farmer'}! 👨‍🌾
        </h1>
        <p className="text-muted-foreground text-lg">
          Here's what's happening with your crop predictions today
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.title}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              onClick={() => router.push(action.href)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${action.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{action.title}</h3>
                    <p className="text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estimations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalEstimations)}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.thisMonthEstimations} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Yield</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.averageYield)} kg</div>
            <p className="text-xs text-muted-foreground">Per acre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Estimated total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accuracy}%</div>
            <Progress value={stats.accuracy} className="mt-2" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Yield Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Yield Trends</span>
            </CardTitle>
            <CardDescription>Monthly yield trends for major crops</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="wheat" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="rice" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="corn" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Crop Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Leaf className="h-5 w-5" />
              <span>Crop Distribution</span>
            </CardTitle>
            <CardDescription>Distribution of crops in your estimations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cropDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cropDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Estimations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Estimations</span>
            </CardTitle>
            <CardDescription>Your latest crop yield estimations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEstimations.map((estimation) => (
                <div
                  key={estimation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Leaf className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{estimation.cropType}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(estimation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatNumber(estimation.estimatedYield)} kg
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(estimation.estimatedTotalValue)}
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-4">
                    {estimation.accuracy}% accuracy
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => router.push('/history')}>
                View All History
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
