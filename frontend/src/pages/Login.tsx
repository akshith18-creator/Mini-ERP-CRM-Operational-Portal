import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Boxes, Lock, Mail, UserCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@erp.com',
      password: 'admin123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      showToast('Welcome back! Successfully logged in.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to sign in', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (email: string) => {
    setValue('email', email);
    setValue('password', 'admin123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/40 mb-4">
            <Boxes className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-white tracking-tight">
            Mini ERP + CRM Portal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sign in to access your operational workspace
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                {...register('email')}
                type="email"
                placeholder="name@company.com"
                className="w-full pl-11 pr-4 py-3 text-sm bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-400 mt-1.5">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 text-sm bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-400 mt-1.5">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full py-3 text-sm font-semibold">
            Sign In to Portal
          </Button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs text-center text-slate-400 font-semibold uppercase tracking-wider mb-3">
            Quick Fill Demo Accounts (Password: admin123)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setDemoCredentials('admin@erp.com')}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-rose-300 border border-rose-900/50 rounded-xl font-medium transition-colors text-left flex items-center gap-2"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Admin User
            </button>
            <button
              onClick={() => setDemoCredentials('sales@erp.com')}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-sky-300 border border-sky-900/50 rounded-xl font-medium transition-colors text-left flex items-center gap-2"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Sales Rep
            </button>
            <button
              onClick={() => setDemoCredentials('warehouse@erp.com')}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-amber-300 border border-amber-900/50 rounded-xl font-medium transition-colors text-left flex items-center gap-2"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Warehouse Mgr
            </button>
            <button
              onClick={() => setDemoCredentials('accounts@erp.com')}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-purple-300 border border-purple-900/50 rounded-xl font-medium transition-colors text-left flex items-center gap-2"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Accounts User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
