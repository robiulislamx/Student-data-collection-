import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, ArrowLeft, GraduationCap } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (email: string) => void;
  onNavigate: (view: 'landing' | 'student-register' | 'status-check' | 'admin-login') => void;
}

export default function AdminLogin({ onLoginSuccess, onNavigate }: AdminLoginProps) {
  const [email, setEmail] = useState('allisonburgee@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorText('');

    setTimeout(() => {
      // Validate credentials
      if (email.trim() === 'allisonburgee@gmail.com' && password === 'admin123') {
        onLoginSuccess(email);
      } else {
        setErrorText('ভুল ইমেইল অথবা পাসওয়ার্ড প্রবেশ করিয়েছেন। সঠিক ক্রেডেনশিয়াল ব্যবহার করুন।');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="bg-slate-900 min-h-screen flex flex-col justify-between text-slate-300">
      {/* Top clean nav bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-950">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-2 text-slate-400 hover:text-white text-xs transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>হোমপেজ এ ফিরে যান</span>
        </button>
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-5 w-5 text-brand-600" />
          <span className="font-display font-bold text-sm text-white tracking-wider font-mono">SIMS ADMINISTRATIVE CORE</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute right-0 top-0 translate-x-14 -translate-y-14 w-32 h-32 rounded-full bg-brand-600/10 blur-2xl" />
          
          <div className="text-center space-y-2">
            <div className="bg-brand-600 text-white p-3 rounded-2xl w-fit mx-auto shadow-lg shadow-brand-600/20">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-white font-display font-extrabold text-2xl tracking-tight">অ্যাডমিন লগইন পোর্টাল</h2>
            <p className="text-slate-500 text-xs">Administrative & Academic Board Portal Integration</p>
          </div>

          {errorText && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-4 rounded-xl flex items-start space-x-3">
              <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-2">অ্যাডমিন ইউজার ইমেইল (Email Address)</label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-600 absolute left-4 top-3.5" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white font-mono focus:border-brand-600 focus:outline-none transition-all"
                  placeholder="admin@sims.edu.bd"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-2">সিকিউরিটি পাসওয়ার্ড (Master Password)</label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-600 absolute left-4 top-3.5" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white font-mono focus:border-brand-600 focus:outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-600 hover:bg-brand-700 hover:scale-[1.01] active:scale-[0.99] text-white py-3.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-brand-500/10 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                  <span>ভেরিফাই করা হচ্ছে...</span>
                </>
              ) : (
                <span>লগইন করুন</span>
              )}
            </button>
          </form>

          {/* Sandbox Helpers Quick Credentials Stamp */}
          <div className="border-t border-slate-900 pt-4 bg-slate-950 p-4 rounded-xl border border-slate-800/60 font-mono text-center text-xs space-y-1.5 text-slate-500">
            <span className="block text-brand-500 font-bold">// QUICK SANDBOX LOGIN CHECK</span>
            <p>Admin Email: <span className="text-slate-300">allisonburgee@gmail.com</span></p>
            <p>Password: <span className="text-slate-300">admin123</span></p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-[10px] text-slate-600 font-mono">
        SECURE HTTPS SIGN-IN PROTOCOL ENFORCED BY CRYPTOGRAPHIC SESSION MANAGER.
      </footer>
    </div>
  );
}
