import React from 'react';
import { GraduationCap, UserCheck, ShieldCheck, Database, FileSpreadsheet, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: 'landing' | 'student-register' | 'status-check' | 'admin-login') => void;
  stats: {
    total: number;
    approved: number;
  };
}

export default function LandingPage({ onNavigate, stats }: LandingPageProps) {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* Header Banner */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="bg-brand-600 text-white p-2 rounded-xl shadow-md shadow-brand-600/10">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-slate-900 tracking-tight">SIMS Portal</span>
              <span className="text-xs block font-mono text-slate-400">Enterprise Edition v2.6</span>
            </div>
          </div>
          <button
            id="admin-portal-header-btn"
            onClick={() => onNavigate('admin-login')}
            className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors border border-slate-200 hover:border-brand-100 bg-slate-50 px-4 py-2 rounded-xl"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Admin Portal</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-brand-50 border border-brand-100 text-brand-700 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide">
              <span>🇧🇩 INTEGRATED BANGLADESH ACADEMIC LEDGER</span>
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight leading-none">
              Student Information <br />
              <span className="text-brand-600 bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">Management System</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-xl leading-relaxed">
              একটি স্বয়ংক্রিয় ও নিরাপদ ডিজিটাল প্ল্যাটফর্ম যার মাধ্যমে শিক্ষার্থীরা সহজেই নিজেদের তথ্য জমা, সংশোধন করতে পারে এবং শিক্ষাপ্রতিষ্ঠানসমূহ দ্রুত যাচাই ও অনুমোদন দিতে পারে।
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button
                id="hero-register-btn"
                onClick={() => onNavigate('student-register')}
                className="bg-brand-600 hover:bg-brand-700 hover:scale-[1.02] text-white px-8 py-4 rounded-xl font-medium shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center space-x-3 text-base"
              >
                <span>শিক্ষার্থী রেজিস্ট্রেশন ফর্ম</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                id="hero-status-btn"
                onClick={() => onNavigate('status-check')}
                className="text-slate-700 hover:text-brand-700 border border-slate-200 hover:border-brand-300 bg-white px-8 py-4 rounded-xl font-medium transition-all flex items-center justify-center space-x-3 text-base"
              >
                <span>আবেদনের বর্তমান অবস্থা যাচাই</span>
              </button>
            </div>

            {/* Quick Live Analytics counter indicators */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-6 max-w-sm">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-xs font-mono text-slate-400 block uppercase tracking-wider">রিয়েল-টাইম শিক্ষার্থী</span>
                <span className="text-2xl font-bold font-sans text-slate-900">{stats.total} +</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-xs font-mono text-slate-400 block uppercase tracking-wider">ভেরিফাইড রস্টার</span>
                <span className="text-2xl font-bold font-sans text-emerald-600">{stats.approved} +</span>
              </div>
            </div>
          </div>

          {/* Graphical decorative illustration box */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-3xl opacity-5 blur-2xl -z-10" />
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="h-2 w-full bg-slate-100 absolute top-0 left-0">
                <div className="h-full w-2/3 bg-brand-600 transition-all" />
              </div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-slate-400">BIDIRECTIONAL WORKFLOW SYNC</span>
                <span className="flex items-center space-x-1 text-xs bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                  Live Syncing
                </span>
              </div>

              {/* Dynamic visualization flow */}
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-brand-50 text-brand-600 p-2 rounded-lg">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-slate-800">Student Registers App</span>
                      <span className="text-[10px] text-slate-400 font-mono">Input filters check duplicate keys</span>
                    </div>
                  </div>
                  <UserCheck className="h-4 w-4 text-brand-600" />
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-amber-50 text-amber-600 p-2 rounded-lg">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-slate-800">Admin Approval Audit</span>
                      <span className="text-[10px] text-slate-400 font-mono">Dispatches SMTP confirmation</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-indigo-400" />
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-slate-800">Google Sheets Sync</span>
                      <span className="text-[10px] text-slate-400 font-mono">Real-time spreadsheet append row</span>
                    </div>
                  </div>
                  <Database className="h-4 w-4 text-emerald-600" />
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-slate-900 text-slate-400 font-mono text-xs space-y-1">
                <p className="text-emerald-400">// Strict Duplicate Guard Policy</p>
                <p>IF student_id EXISTS IN Db OR email EXISTS OR mobile EXISTS THEN REJECT SUBMISSION;</p>
                <p className="text-slate-500">Status code: 409 [DUPLICATE_REGISTRY]</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview stats cards section */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-display font-bold text-3xl text-slate-900">How The System Operates Securely</h2>
            <p className="text-slate-500 text-sm mt-3">
              অত্যাধুনিক ডুপ্লিকেট চেকার, জিমেইল এলার্ট এবং স্প্রেডশীট ইন্টিগ্রেশনের মাধ্যমে প্রতিটি শিক্ষার্থীর তথ্য সুরক্ষিত ও নিয়ন্ত্রিত উপায়ে সংরক্ষিত হয়।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-slate-800">
              <div className="bg-rose-50 text-rose-600 p-3 rounded-xl w-fit mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Duplicate Prevention Gate</h3>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                পোর্টালে কোন শিক্ষার্থী একের অধিক আবেদন করতে পারবে না। ইমেইল, মোবাইল নম্বর এবং স্টুডেন্ট আইডি মিলিয়ে কঠোর জ্যামিং ফিল্টার দ্বারা স্প্যাম রোধ করা হয়।
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-slate-800">
              <div className="bg-brand-50 text-brand-600 p-3 rounded-xl w-fit mb-4">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Google Sheets Ledger</h3>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                প্রতিটি ভেরিফাইড ডাটা সরাসরি সংযুক্ত গুগল শীটে রিয়েল-টাইমে সেভ হয়ে থাকে। ডাটা এনালিস্টরা সরাসরি স্প্রেডশীট থেকে ডাউনলোড বা এক্সপোর্ট করতে পারেন।
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-slate-800">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl w-fit mb-4">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Immediate Gmail Sync</h3>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                নতুন আবেদন জমাদানের সাথে সাথে অ্যাডমিন ইমেইলে নোটিফিকেশন পৌঁছে যায়। চূড়ান্ত অনুমোদন বা যুক্তিযুক্ত প্রত্যাখ্যানের ইমেইল স্বয়ংক্রিয়ভাবে শিক্ষার্থীদের নিকট চলে যায়।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-400 space-y-2 font-mono">
          <p>© 2026 Student Information Management System (SIMS). Developed in full alignment with SaaS-level quality guidelines.</p>
          <p className="text-slate-300">Technology Stack: Node Express proxy backend, React 19 Frontend with Tailwind configuration</p>
        </div>
      </footer>
    </div>
  );
}
