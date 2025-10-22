'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { Navbar } from '@/components/navigation/Navbar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Leaf, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  Target,
  Users,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { state } = useApp();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.push('/');
    }
  }, [state.isAuthenticated, state.isLoading, router]);

  // Show loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!state.isAuthenticated) {
    return null; // Will redirect
  }

  const quickActions = [
    {
      title: 'Crop Yield Prediction',
      description: 'Estimate crop yields based on soil properties',
      icon: BarChart3,
      href: '/home/crop_yield',
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Crop Recommendation',
      description: 'Get AI-powered crop suggestions for your soil',
      icon: Leaf,
      href: '/home/croprecommendation',
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Soil Data Analysis',
      description: 'Analyze and visualize soil properties',
      icon: MapPin,
      href: '/home/soildata',
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

  

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome back, {state.user?.displayName || 'Farmer'}! 👨‍🌾
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered agricultural assistant is ready to help you make informed decisions about your crops.
          </p>
        </motion.div>

        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.title}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
                  onClick={() => router.push(action.href)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-foreground mb-2">{action.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{action.description}</p>
                      </div>
                      <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-all duration-300 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        
      </main>
    </div>
  );
}