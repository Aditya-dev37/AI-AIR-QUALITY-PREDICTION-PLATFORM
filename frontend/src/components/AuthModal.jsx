import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, ArrowRight } from 'lucide-react';
import api from '../api/client';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);

    const isGovAdmin = email.toLowerCase().includes('gov') || email.toLowerCase().includes('admin');
    const assignedRole = isGovAdmin ? 'admin' : 'citizen';

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister 
        ? { email, password: password || 'Demo12345!', full_name: fullName || email.split('@')[0], role: assignedRole }
        : { email, password: password || 'Demo12345!' };

      const res = await api.post(endpoint, payload);
      const token = res.data.access_token || 'demo-jwt-token-2026';
      const user = res.data.user || {
        email: email,
        full_name: fullName || (isGovAdmin ? 'Gov Officer' : 'Citizen User'),
        role: assignedRole
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      const user = {
        email: email,
        full_name: fullName || (isGovAdmin ? 'Gov Officer' : 'Citizen User'),
        role: assignedRole
      };

      localStorage.setItem('token', 'demo-jwt-token-2026');
      localStorage.setItem('user', JSON.stringify(user));
      onAuthSuccess(user);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = (type) => {
    if (type === 'admin') {
      setEmail('officer@vaydrishti.gov.in');
      setPassword('Admin@123');
      const user = { email: 'officer@vaydrishti.gov.in', full_name: 'Govt. Policy Officer', role: 'admin' };
      localStorage.setItem('token', 'demo-jwt-token-2026');
      localStorage.setItem('user', JSON.stringify(user));
      onAuthSuccess(user);
      onClose();
    } else {
      setEmail('citizen@example.com');
      setPassword('Citizen@123');
      const user = { email: 'citizen@example.com', full_name: 'Resident Citizen', role: 'citizen' };
      localStorage.setItem('token', 'demo-jwt-token-2026');
      localStorage.setItem('user', JSON.stringify(user));
      onAuthSuccess(user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-teal-500/20 text-teal-300 rounded-2xl border border-teal-500/30">
            <Lock className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              {isRegister ? 'Create VayuDrishti Account' : 'Sign In to VayuDrishti'}
            </h3>
            <p className="text-xs text-slate-400">
              {isRegister ? 'Register as Citizen or Govt Officer' : 'Access Analytics & Customized Alerts'}
            </p>
          </div>
        </div>

        <div className="mb-6 bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
            ⚡ Quick Demo Logins (1-Click)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickDemoLogin('citizen')}
              className="py-2 px-3 bg-slate-900 hover:bg-teal-500/20 hover:text-teal-300 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-teal-400" /> Citizen Account
            </button>
            <button
              type="button"
              onClick={() => quickDemoLogin('admin')}
              className="py-2 px-3 bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" /> Govt / Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Officer Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="e.g. officer@gov.in or user@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Tip: Emails with <code className="text-amber-400">gov.in</code> auto-assign Admin/Government Role!
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-slate-950 font-black rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <span>{isRegister ? 'Register Account' : 'Sign In Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-teal-400 font-bold hover:underline ml-1"
          >
            {isRegister ? 'Sign In' : 'Register Free'}
          </button>
        </div>
      </div>
    </div>
  );
}
