import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('trader@stockmarket.com');
  const [password, setPassword] = useState('Trader@123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login({ email, password });
      login(res);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 rounded-3xl bg-[#151F30] border border-[#1E293B] shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-xl text-white mx-auto shadow-lg shadow-blue-500/20">
            S
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Access Financial Terminal</h2>
          <p className="text-xs text-slate-400">
            Sign in with your trader credentials to sync watchlists, alerts, and one-time software licenses.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B1220] border border-[#1E293B] text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B1220] border border-[#1E293B] text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Terminal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Fill Buttons */}
        <div className="pt-4 border-t border-[#1E293B] space-y-2 text-xs">
          <p className="text-[11px] text-slate-400 font-medium">Quick Sandbox Accounts:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setEmail('trader@stockmarket.com');
                setPassword('Trader@123456');
              }}
              className="p-2 rounded-lg bg-[#0B1220] hover:bg-[#1E293B] border border-[#1E293B] text-left"
            >
              <p className="font-semibold text-white">Pro Trader</p>
              <p className="text-[10px] text-slate-500 font-mono">trader@stockmarket.com</p>
            </button>
            <button
              onClick={() => {
                setEmail('admin@stockmarket.com');
                setPassword('Admin@123456');
              }}
              className="p-2 rounded-lg bg-[#0B1220] hover:bg-[#1E293B] border border-[#1E293B] text-left"
            >
              <p className="font-semibold text-amber-400">Super Admin</p>
              <p className="text-[10px] text-slate-500 font-mono">admin@stockmarket.com</p>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
};

