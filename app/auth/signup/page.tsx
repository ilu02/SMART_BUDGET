'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password validation (same as settings page)
  const getPasswordRequirements = (password: string): PasswordRequirement[] => {
    return [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'One lowercase letter', met: /[a-z]/.test(password) },
      { label: 'One number', met: /[0-9]/.test(password) },
      { label: 'One special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
    ];
  };

  const passwordRequirements = getPasswordRequirements(password);
  const isPasswordValid = passwordRequirements.every(req => req.met);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    if (!name || !email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (!isPasswordValid) {
      toast.error('Password does not meet all requirements');
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
            
            {/* Password Requirements Display */}
            {password && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-gray-700">Password Requirements:</p>
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs">
                    {req.met ? (
                      <i className="ri-checkbox-circle-fill text-green-500"></i>
                    ) : (
                      <i className="ri-checkbox-blank-circle-line text-gray-400"></i>
                    )}
                    <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {submitted && !password && (
              <p className="mt-2 text-sm text-red-600">Password is required.</p>
            )}
            {submitted && password && !isPasswordValid && (
              <p className="mt-2 text-sm text-red-600">Password does not meet all requirements.</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || (submitted && !isPasswordValid)}
            loading={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

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
