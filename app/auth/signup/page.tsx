'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    if (!name || !email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account created successfully!');
        router.push('/auth/login');
      } else {
        toast.error(data.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
      {/* Left Side */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 text-white p-8 md:p-12 flex-col justify-center">
        <div className="flex items-center mb-8">
          <div className="bg-white/20 p-3 rounded-lg">
            <i className="ri-wallet-3-line text-3xl" aria-hidden="true"></i>
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">Smart Budget</h1>
        <p className="text-blue-100 mb-8">
          Take control of your finances with intelligent budgeting, spending insights, and personalized recommendations.
        </p>
        <ul className="space-y-4">
          <li className="flex items-center">
            <i className="ri-check-line text-green-400 mr-3" aria-hidden="true"></i>
            <span>Track expenses automatically</span>
          </li>
          <li className="flex items-center">
            <i className="ri-check-line text-green-400 mr-3" aria-hidden="true"></i>
            <span>Smart budget recommendations</span>
          </li>
          <li className="flex items-center">
            <i className="ri-check-line text-green-400 mr-3" aria-hidden="true"></i>
            <span>Detailed financial insights</span>
          </li>
        </ul>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 p-8 md:p-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h2>
        <p className="text-gray-600 mb-8">Start your journey to financial wellness</p>

        <form onSubmit={handleSignup}>
          <div className="mb-6">
            <Input
              id="name"
              type="text"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              error={submitted && !name ? 'Full name is required.' : undefined}
              required
            />
          </div>

          <div className="mb-6">
            <Input
              id="email"
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              error={submitted && !email ? 'Email is required.' : undefined}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 px-4 text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-r-lg"
              >
                <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} aria-hidden="true"></i>
              </button>
            </div>
            {submitted && !password && (
              <p className="mt-2 text-sm text-red-600">Password is required.</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="my-8 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-sm text-gray-500">Or continue with</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="w-full" size="lg">
            <i className="ri-google-fill text-red-500 mr-2" aria-hidden="true"></i>
            Google
          </Button>
          <Button variant="outline" className="w-full" size="lg">
            <i className="ri-apple-fill mr-2" aria-hidden="true"></i>
            Apple
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            href="/auth/login" 
            className="font-medium text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}