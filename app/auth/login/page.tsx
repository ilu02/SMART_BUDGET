'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FloatingInput } from '@/components/ui/FloatingInput';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@example.com');
    setPassword('password123');
    toast.success('Demo credentials filled in');
  };

  return (
    <div className="w-full max-w-6xl glass shadow-brand rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-100 animate-fade-in">
      {/* Mobile Header */}
      <div className="mobile-auth-header">
        <div className="flex items-center mb-4">
          <div className="brand-logo mr-3">
            <i className="ri-wallet-3-line text-2xl text-white" aria-hidden="true"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Smart Budget</h1>
            <p className="text-blue-100 text-sm">Financial wellness made simple</p>
          </div>
        </div>
      </div>

      {/* Left Side */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-auth text-white p-8 md:p-12 flex-col justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="auth-decoration auth-decoration-1"></div>
        <div className="auth-decoration auth-decoration-2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-8 animate-slide-up stagger-1">
            <div className="brand-logo mr-4">
              <i className="ri-wallet-3-line text-3xl text-white" aria-hidden="true"></i>
            </div>
            <div>
              <h1 className="text-4xl font-bold">Smart Budget</h1>
              <p className="text-blue-100 text-sm">Financial wellness made simple</p>
            </div>
          </div>
          
          <div className="animate-slide-up stagger-2">
            <p className="text-blue-100 mb-8 text-lg leading-relaxed">
              Take control of your finances with intelligent budgeting, spending insights, and personalized recommendations.
            </p>
          </div>
          
          <ul className="space-y-4">
            <li className="flex items-center animate-slide-up stagger-3">
              <div className="bg-green-400/20 p-1 rounded-full mr-3">
                <i className="ri-check-line text-green-400 text-sm" aria-hidden="true"></i>
              </div>
              <span>Track expenses automatically</span>
            </li>
            <li className="flex items-center animate-slide-up stagger-3">
              <div className="bg-green-400/20 p-1 rounded-full mr-3">
                <i className="ri-check-line text-green-400 text-sm" aria-hidden="true"></i>
              </div>
              <span>Smart budget recommendations</span>
            </li>
            <li className="flex items-center animate-slide-up stagger-4">
              <div className="bg-green-400/20 p-1 rounded-full mr-3">
                <i className="ri-check-line text-green-400 text-sm" aria-hidden="true"></i>
              </div>
              <span>Detailed financial insights</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 p-8 md:p-12 relative">
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold gradient-text-blue mb-2">Welcome back</h2>
          <p className="text-gray-600 mb-8">Sign in to access your financial dashboard</p>

          <form onSubmit={handleLogin} className="animate-fade-in">
            <div className="mb-8 animate-slide-up stagger-1">
              <FloatingInput
                id="email"
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={submitted && !email ? 'Email is required.' : undefined}
                required
              />
            </div>

            <div className="mb-8 animate-slide-up stagger-2">
              <FloatingInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={submitted && !password ? 'Password is required.' : undefined}
                showPasswordToggle
                onTogglePassword={() => setShowPassword(!showPassword)}
                isPasswordVisible={showPassword}
                required
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" 
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <Link 
                href="#" 
                className="text-sm text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">Demo Account</p>
              <Button
                variant="outline"
                onClick={fillDemoCredentials}
                className="w-full mb-3"
                disabled={loading}
              >
                <i className="ri-user-line mr-2" aria-hidden="true"></i>
                Use Demo Credentials
              </Button>
              <div className="text-xs text-gray-500">
                <p>Email: demo@example.com</p>
                <p>Password: password123</p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link 
              href="/auth/signup" 
              className="font-medium text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}