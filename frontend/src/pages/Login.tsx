<<<<<<< HEAD
// login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
=======

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Sofa } from 'lucide-react';
import { Button, Input } from '../components/UI';
import axios from 'axios';
>>>>>>> d7e5c1dad3100cb0720ba90d011e145ef5d4bbe6

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
<<<<<<< HEAD
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials or connection error.');
=======
      window.location.href = '/dashboard'; 
    } catch (err: unknown) {
      let errorMsg = 'Invalid credentials or connection error.';
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      setError(errorMsg);
>>>>>>> d7e5c1dad3100cb0720ba90d011e145ef5d4bbe6
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen relative overflow-hidden font-sans text-white flex flex-col justify-between">

      {/* Fixed Full-page Background Image - Identical to Landing Page */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-fixed z-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(180deg, rgba(4, 17, 42, 0.45) 0%, rgba(4, 17, 42, 0.65) 100%), url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1800')"
        }}
      />

      {/* Repeating Blueprint Dot Grid texture overlay */}
      <div
        className="fixed inset-0 opacity-[0.035] z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Soft Decorative Ambient Glow spots */}
      <div className="absolute top-[-5%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#FF7A00]/8 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-5%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#0066FF]/6 blur-[140px] pointer-events-none z-0"></div>

      {/* Top Header Panel */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 w-full py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-[#FF7A00] rounded-lg flex items-center justify-center shadow-lg shadow-[#FF7A00]/20">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Shiv<span className="text-[#FF7A00]">ERP</span></span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-xs font-bold text-white/80 hover:text-white transition-colors uppercase tracking-wider cursor-pointer bg-transparent border-0 outline-none"
        >

        </button>
      </header>

      {/* Center Main Box */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Floating Welcome Back glass header */}
        <div
          className="w-full max-w-md p-6 rounded-2xl mb-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.35)] border border-white/8"
          style={{
            background: 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <h1 className="text-2xl font-black tracking-tight text-white leading-tight">Welcome Back</h1>
          <p className="text-white/60 text-xs mt-1.5 font-medium">Sign in to manage your production floor</p>
        </div>

        {/* Main Login Card panel */}
        <div
          className="w-full max-w-md p-8 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.5)] border border-white/8 relative overflow-hidden"
          style={{
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Soft background glow spot inside the credentials card */}
          <div className="absolute top-[-10%] right-[-10%] w-[180px] h-[180px] rounded-full bg-[#FF7A00]/10 blur-[40px] pointer-events-none" />

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-4 rounded-xl mb-6 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Work Email input */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/50">WORK EMAIL</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 border border-white/10 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.07] focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] outline-none transition-all text-white placeholder-white/40 text-xs"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/50">PASSWORD</label>
                <button
                  type="button"
                  onClick={() => alert("Password reset requires administrator approval. Please contact system administrator.")}
                  className="text-[10px] font-bold text-[#FF7A00] hover:text-[#FF9F43] transition-colors bg-transparent border-0 outline-none cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-white/40" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 border border-white/10 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.07] focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] outline-none transition-all text-white placeholder-white/40 text-xs"
                />
              </div>
            </div>

            {/* Stay signed in checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="stay-signed"
                className="w-4 h-4 rounded border-white/10 bg-white/[0.03] text-[#FF7A00] focus:ring-[#FF7A00] focus:ring-offset-0 focus:outline-none cursor-pointer"
              />
              <label htmlFor="stay-signed" className="text-[10px] text-white/60 font-bold uppercase tracking-wider cursor-pointer select-none">
                Stay signed in for 30 days
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full h-12 text-xs font-bold bg-[#FF7A00] hover:bg-[#d96500] text-white rounded-lg transition-all duration-300 shadow-md shadow-[#FF7A00]/10 hover:shadow-[#FF7A00]/20 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom Link to landing page */}
          <div className="mt-8 text-center">
            <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  navigate('/');
                  setTimeout(() => {
                    alert("Account registration requires approval. Please submit a request via the 'Request a Personalized Demo' or 'Get Started' form on the landing page.");
                  }, 400);
                }}
                className="text-[#FF7A00] hover:text-[#FF9F43] transition-colors font-bold bg-transparent border-0 outline-none cursor-pointer"
              >
                Create Account
              </button>
            </p>
          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 py-6 text-center text-[10px] text-white/40 uppercase tracking-widest bg-transparent font-medium">
        ShivERP © 2026. Private Enterprise System.
      </footer>

=======
    <div className="flex items-center justify-center min-h-screen bg-faded-white relative overflow-hidden font-sans text-luxury-brown">
      {/* Decorative furniture elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-luxury-brown/5 skew-x-12 translate-x-20"></div>
      <div className="absolute bottom-10 left-10 opacity-5 pointer-events-none">
         <Sofa className="w-96 h-96" />
      </div>

      <div className="bg-white p-12 rounded-2xl shadow-xl w-full max-w-md relative z-10 border border-white/50 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 bg-luxury-brown rounded-xl shadow-lg mb-6">
            <Sofa className="w-10 h-10 text-faded-white" />
          </div>
          <h1 className="text-2xl font-bold text-center">SHIV FURNITURE</h1>
          <p className="text-warm-taupe text-[10px] font-semibold uppercase tracking-wider mt-2">Executive Portal</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-semibold uppercase tracking-wider p-4 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Corporate Email" 
            type="email" 
            placeholder="name@shivfurniture.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Secure Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />
          <Button 
            type="submit" 
            className="w-full py-4 text-sm font-semibold tracking-wider shadow-lg shadow-luxury-brown/10"
          >
            Authenticate
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-[#f1ede4] text-center">
          <p className="text-[10px] font-semibold text-warm-taupe uppercase tracking-wider leading-loose">
            Private Enterprise System<br/>
            Authorized Personnel Only
          </p>
        </div>
      </div>
>>>>>>> d7e5c1dad3100cb0720ba90d011e145ef5d4bbe6
    </div>
  );
};

export default Login;
