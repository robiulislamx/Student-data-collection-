import React, { useState } from 'react';
import { 
  Database, FileSpreadsheet, Mail, ShieldAlert, CheckCircle, XCircle, AlertCircle, 
  Search, Filter, Download, UserCheck, Plus, Trash, Trash2, Settings, FileText, 
  BookOpen, Sparkles, LogOut, RefreshCw, Layers, LayoutDashboard, Globe, ExternalLink 
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';
import Markdown from 'react-markdown';
import { DatabaseState, StudentSubmission, DynamicField, AuditLog, NotificationLog } from '../types';
import { TECHNICAL_DOCS } from '../docs';

interface AdminDashboardProps {
  db: DatabaseState;
  adminEmail: string;
  onLogout: () => void;
  onRefreshDB: () => void;
}

export default function AdminDashboard({ db, adminEmail, onLogout, onRefreshDB }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'builder' | 'integrations' | 'audits' | 'wiki'>('overview');
  
  // Filtering & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInstitutionType, setFilterInstitutionType] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'newest' | 'id'>('newest');

  // Selected student side-panel overlay
  const [selectedStudent, setSelectedStudent] = useState<StudentSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Dynamic form builder local state
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'dropdown' | 'checkbox' | 'radio'>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldCategory, setNewFieldCategory] = useState<'personal' | 'academic' | 'contact' | 'address' | 'additional'>('additional');
  const [newFieldOptionsString, setNewFieldOptionsString] = useState('');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');

  // Settings local state
  const [sheetUrl, setSheetUrl] = useState(db.settings.sheet_url);
  const [syncEnabled, setSyncEnabled] = useState(db.settings.sheet_sync_enabled);
  const [emailEnabled, setEmailEnabled] = useState(db.settings.auto_email_alerts);
  const [notifyEmail, setNotifyEmail] = useState(db.settings.admin_notify_email);

  // Dashboard calculations
  const totalSubmissions = db.submissions.length;
  const pendingSubmissions = db.submissions.filter(s => s.status === 'Pending').length;
  const approvedSubmissions = db.submissions.filter(s => s.status === 'Approved').length;
  const rejectedSubmissions = db.submissions.filter(s => s.status === 'Rejected').length;

  // Chart 1: Daily Submissions Grouping
  const getDailySubmissionsData = () => {
    const dates: Record<string, number> = {};
    db.submissions.forEach(s => {
      const date = new Date(s.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
      dates[date] = (dates[date] || 0) + 1;
    });
    return Object.keys(dates).map(k => ({ date: k, Submissions: dates[k] })).reverse();
  };

  // Chart 2: Institution Distribution Category
  const getInstitutionWiseData = () => {
    const insts: Record<string, number> = {};
    db.submissions.forEach(s => {
      insts[s.institution_type] = (insts[s.institution_type] || 0) + 1;
    });
    return Object.keys(insts).map(k => ({ name: k, count: insts[k] }));
  };

  // Chart 3: Division Wise Distribution
  const getDivisionWiseData = () => {
    const divisions: Record<string, number> = {};
    db.submissions.forEach(s => {
      divisions[s.division || 'Dhaka'] = (divisions[s.division || 'Dhaka'] || 0) + 1;
    });
    return Object.keys(divisions).map(k => ({ name: k, value: divisions[k] }));
  };

  // Chart 4: Department Wise Statistics
  const getDepartmentWiseData = () => {
    const depts: Record<string, number> = {};
    db.submissions.forEach(s => {
      depts[s.department || 'General'] = (depts[s.department || 'General'] || 0) + 1;
    });
    return Object.keys(depts).slice(0, 5).map(k => ({ name: k, count: depts[k] }));
  };

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];

  // Handle Approve Event Action
  const handleApprove = async (id: string) => {
    setIsProcessingAction(true);
    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, admin_email: adminEmail })
      });
      const result = await res.json();
      if (res.ok) {
        onRefreshDB();
        // Update local selection drawer reference
        if (selectedStudent && selectedStudent.id === id) {
          setSelectedStudent(result.submission);
        }
      } else {
        alert(result.error);
      }
    } catch {
      alert("Error approving student profile.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handle Reject Event Action
  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsProcessingAction(true);
    try {
      const res = await fetch('/api/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedStudent.id, reason: rejectionReason, admin_email: adminEmail })
      });
      const result = await res.json();
      if (res.ok) {
        onRefreshDB();
        setSelectedStudent(result.submission);
        setShowRejectModal(false);
        setRejectionReason('');
      } else {
        alert(result.error);
      }
    } catch {
      alert("Error executing rejection transaction.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Create Field Action Handler
  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName || !newFieldLabel) {
      alert("Please key in unique field code and human label.");
      return;
    }

    const payload = {
      name: 'ext_' + newFieldName.trim().replace(/\s+/g, '_').toLowerCase(),
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      category: newFieldCategory,
      placeholder: newFieldPlaceholder,
      options: newFieldOptionsString ? newFieldOptionsString.split(',').map(s => s.trim()) : []
    };

    try {
      const res = await fetch('/api/fields/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        onRefreshDB();
        // Reset states
        setNewFieldName('');
        setNewFieldLabel('');
        setNewFieldPlaceholder('');
        setNewFieldOptionsString('');
        setNewFieldRequired(false);
        alert(`Form template updated successfully: Injected field [${payload.name}]`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch {
      alert("Failed to communicate with field endpoint.");
    }
  };

  // Delete Dynamic Field
  const handleDeleteField = async (id: string) => {
    if (!confirm("Are you sure you want to completely erase this custom field layout? Existing student profiles storing this key will keep their value but it won't render in new submissions.")) return;
    try {
      const res = await fetch('/api/fields/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        onRefreshDB();
      } else {
        alert("Failed to drop field template.");
      }
    } catch {
      alert("Connection failure.");
    }
  };

  // Save Settings Sync
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheet_url: sheetUrl,
          sheet_sync_enabled: syncEnabled,
          auto_email_alerts: emailEnabled,
          admin_notify_email: notifyEmail
        })
      });
      if (res.ok) {
        onRefreshDB();
        alert("Integrations and syncing targets updated successfully!");
      }
    } catch {
      alert("Connection issue saving settings.");
    }
  };

  // Reset entire Database state
  const handleResetDB = async () => {
    if (!confirm("⚠️ CRITICAL SECURITY CONTROL: Are you sure you want to reset the database to pristine Bangladesh Roster seed data? This deletes newer registrations and resets all dynamic fields to developer defaults.")) return;
    try {
      const res = await fetch('/api/db/reset', { method: 'POST' });
      if (res.ok) {
        onRefreshDB();
        alert("Database successfully seeded to original compliant state.");
        setSelectedStudent(null);
      }
    } catch {
      alert("Communication error resetting database.");
    }
  };

  // Clear Audit trails
  const handleClearAudits = async () => {
    if (!confirm("Wipe operations and notification dispatch history trail?")) return;
    try {
      const res = await fetch('/api/logs/clear', { method: 'POST' });
      if (res.ok) onRefreshDB();
    } catch {
      alert("Network failure.");
    }
  };

  // Excel/JSON Data Exporter
  const exportToExcel = () => {
    const headers = ["ID", "Student ID", "Full Name", "Institution", "Type", "Department", "Email", "Mobile", "Status", "Date submitted"];
    const rows = db.submissions.map(s => [
      s.id, s.student_id, s.full_name, s.institution, s.institution_type, s.department, s.email, s.mobile, s.status, s.created_at
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SIMS_StudentRoster_Export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and Search student list
  const getFilteredStudents = () => {
    return db.submissions.filter(s => {
      // Search text against multiple identifiers
      const search = searchTerm.toLowerCase();
      const matchesSearch = !search ||
        s.full_name.toLowerCase().includes(search) ||
        s.student_id.toLowerCase().includes(search) ||
        s.mobile.includes(search) ||
        s.email.toLowerCase().includes(search);

      // Filters
      const matchesInstitutionType = filterInstitutionType === 'All' || s.institution_type === filterInstitutionType;
      const matchesDepartment = filterDepartment === 'All' || s.department.toLowerCase().includes(filterDepartment.toLowerCase());
      const matchesStatus = filterStatus === 'All' || s.status === filterStatus;

      return matchesSearch && matchesInstitutionType && matchesDepartment && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.full_name.localeCompare(b.full_name);
      if (sortBy === 'id') return a.student_id.localeCompare(b.student_id);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // default newest
    });
  };

  const filteredStudentsList = getFilteredStudents();

  // Extract unique departments for filters dropdown
  const uniqueDepartments = Array.from(new Set(db.submissions.map(s => s.department)));

  return (
    <div className="bg-slate-900 min-h-screen text-slate-300 flex flex-col md:flex-row relative">
      {/* Structural Sidebar controls */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 shrink-0 p-6 flex flex-col justify-between md:h-screen sticky top-0 z-30">
        <div className="space-y-8">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-600 text-white p-2.5 rounded-xl shadow-lg">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display font-extrabold text-sm block tracking-widest text-slate-100 uppercase">SIMS Terminal</span>
              <span className="text-[10px] text-slate-500 font-mono">ROLE: SYSTEM_ADMIN</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all uppercase ${activeTab === 'overview' ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>রিয়েল-টাইম ড্যাশবোর্ড</span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all uppercase ${activeTab === 'students' ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
            >
              <Globe className="h-4 w-4" />
              <span>শিক্ষার্থী তালিকা ({db.submissions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('builder')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all uppercase ${activeTab === 'builder' ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
            >
              <Plus className="h-4 w-4" />
              <span>ফর্ম বিল্ডার</span>
            </button>

            <button
              onClick={() => setActiveTab('integrations')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all uppercase ${activeTab === 'integrations' ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>গুগল শীট ও মেল সিঙ্ক</span>
            </button>

            <button
              onClick={() => setActiveTab('audits')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all uppercase ${activeTab === 'audits' ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>নিরাপত্তা ও অডিট লগ</span>
            </button>

            <button
              onClick={() => setActiveTab('wiki')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all uppercase ${activeTab === 'wiki' ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
            >
              <BookOpen className="h-4 w-4" />
              <span>সিস্টেম ডিজাইন উইকি</span>
            </button>
          </nav>
        </div>

        {/* Administrator profile badge footer */}
        <div className="border-t border-slate-800 pt-4 mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="max-w-[120px] truncate">
              <span className="text-[10px] block font-mono text-slate-500">SIGNED ADMIN:</span>
              <span className="text-xs font-mono text-slate-300 font-bold max-w-full block truncate">{adminEmail}</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log Out Terminal"
            className="text-slate-500 hover:text-rose-400 p-1 rounded-md hover:bg-slate-900 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Primary Dynamic Panel View */}
      <main className="flex-1 p-6 md:p-8 space-y-8 md:h-screen overflow-y-auto w-full">
        {/* Banner header controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-5 gap-4">
          <div>
            <h2 className="text-white font-display font-extrabold text-2xl tracking-tight">
              {activeTab === 'overview' && 'ড্যাশবোর্ড এনালাইটিক্স (Business Intelligence)'}
              {activeTab === 'students' && 'শিক্ষার্থী তথ্য যাচাই ও রেজিস্টার (Student Verification Ledger)'}
              {activeTab === 'builder' && 'ডায়নামিক ফর্ম বিল্ডার (Dynamic Schema Configuration)'}
              {activeTab === 'integrations' && 'গুগল স্প্রেডশীট ও জিমেইল ইন্টিগ্রেশন (Workspace Sync)'}
              {activeTab === 'audits' && 'ফরেনসিক সিকিউরিটি ও অডিট ট্রেইল (Audit Logs)'}
              {activeTab === 'wiki' && 'সিস্টেম আর্কিটেকচার ব্লুপ্রিন্ট ও সোর্স কোড উইকি'}
            </h2>
            <p className="text-slate-500 text-xs font-mono">
              Bengal Region Authority Operational Portal • Live GMT 2026-06-02
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onRefreshDB();
                alert("Database state re-synchronized from local JSON container.");
              }}
              title="Refresh database records"
              className="p-2 border border-slate-800 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs font-mono">Reload Recs</span>
            </button>
          </div>
        </div>

        {/* Dynamic tabs renderers */}
        
        {/* TAB 1: OVERVIEW ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Bento counter metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 h-16 w-16 rounded-full bg-brand-600/5 blur-xl" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">সর্বমোট আবেদন (Total Grid)</span>
                <span className="text-3xl font-extrabold text-slate-100 tracking-tight block mt-2 font-display">{totalSubmissions}</span>
                <span className="text-[10px] text-brand-400 mt-2 block font-mono">✔ 100% Core Index Integ</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider block">যাচাই অপেক্ষারত (Pending)</span>
                <span className="text-3xl font-extrabold text-amber-400 tracking-tight block mt-2 font-display">{pendingSubmissions}</span>
                <span className="text-[10px] text-slate-500 mt-2 block font-mono">Action required for Sync</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider block">অনুমোদিত শিক্ষার্থী (Approved)</span>
                <span className="text-3xl font-extrabold text-emerald-400 tracking-tight block mt-2 font-display">{approvedSubmissions}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit mt-2 block font-mono text-[9px]">
                  Sheets Synced
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] font-mono text-rose-500 uppercase tracking-wider block">আবেদন বাতিল (Rejected)</span>
                <span className="text-3xl font-extrabold text-rose-500 tracking-tight block mt-2 font-display">{rejectedSubmissions}</span>
                <span className="text-[10px] text-slate-500 mt-2 block font-mono">Requires update inputs</span>
              </div>
            </div>

            {/* Interactive charts visual analytics panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Submission volumes chart */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-semibold tracking-wide text-slate-200 mb-4 uppercase font-mono">Daily Submissions Timeline Metrics</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getDailySubmissionsData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
                      <Line type="monotone" dataKey="Submissions" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Institution distribution */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-semibold tracking-wide text-slate-200 mb-4 uppercase font-mono">Institution Wise Category Ratios</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getInstitutionWiseData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '10px' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                        {getInstitutionWiseData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Divisional Distribution Pie */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-semibold tracking-wide text-slate-200 mb-4 uppercase font-mono">Student Divisions Allocation Ratio</h3>
                <div className="h-64 w-full flex items-center justify-center">
                  <div className="w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getDivisionWiseData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {getDivisionWiseData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 space-y-1 text-xs">
                    {getDivisionWiseData().map((entry, index) => (
                      <div key={entry.name} className="flex items-center space-x-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-slate-400 font-medium">{entry.name}:</span>
                        <span className="font-mono text-white font-bold">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Department wise chart */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-semibold tracking-wide text-slate-200 mb-4 uppercase font-mono">Department Wise Registries Breakdown</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={getDepartmentWiseData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" stroke="#64748b" style={{ fontSize: '10px' }} />
                      <YAxis type="category" dataKey="name" stroke="#64748b" style={{ fontSize: '9px' }} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a' }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CENTRAL STUDENTS LEDGER TABLE */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Searching Filters Header Card layout */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 text-slate-600 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, student id, phone..."
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-600 font-mono"
                  />
                </div>

                <div>
                  <select
                    value={filterInstitutionType}
                    onChange={(e) => setFilterInstitutionType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl px-4 py-3 text-slate-300 focus:outline-none"
                  >
                    <option value="All">All Institution Types</option>
                    <option value="School">School</option>
                    <option value="College">College</option>
                    <option value="Polytechnic">Polytechnic</option>
                    <option value="University">University</option>
                    <option value="Madrasa">Madrasa</option>
                  </select>
                </div>

                <div>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl px-4 py-3 text-slate-300 focus:outline-none"
                  >
                    <option value="All">All Departments</option>
                    {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl px-4 py-3 text-slate-300 focus:outline-none"
                  >
                    <option value="All">All Status Options</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Sorting and CSV Exports controllers */}
              <div className="flex flex-col sm:flex-row justify-between items-center border-t border-slate-900 pt-4 gap-4 text-xs">
                <div className="flex items-center space-x-4">
                  <span className="text-slate-500 font-mono">Sort Order:</span>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" checked={sortBy === 'newest'} onChange={() => setSortBy('newest')} className="text-brand-600" />
                    <span>Newest Submission</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" checked={sortBy === 'name'} onChange={() => setSortBy('name')} className="text-brand-600" />
                    <span>Student Name</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" checked={sortBy === 'id'} onChange={() => setSortBy('id')} className="text-brand-600" />
                    <span>Student ID string</span>
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 mr-1 font-mono">Roster matches: {filteredStudentsList.length}</span>
                  <button
                    onClick={exportToExcel}
                    className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-[11px] px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition-all font-mono"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Secure CSV roster.xls</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main structural grid displaying filtered students roster side-by-side with drawer panel */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Table ledger */}
              <div className="xl:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-indigo-400 font-mono tracking-wider">
                        <th className="p-4 uppercase font-bold">Student Name & ID</th>
                        <th className="p-4 uppercase font-bold">Institution</th>
                        <th className="p-4 uppercase font-bold">Department</th>
                        <th className="p-4 uppercase font-bold">Contact</th>
                        <th className="p-4 uppercase font-bold">Status badger</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {filteredStudentsList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500">
                            No registers matched filtering queries. Give fewer criteria constraints.
                          </td>
                        </tr>
                      ) : (
                        filteredStudentsList.map(s => (
                          <tr 
                            id={`student-row-${s.id}`}
                            key={s.id} 
                            onClick={() => {
                              setSelectedStudent(s);
                              setRejectionReason('');
                            }}
                            className={`hover:bg-slate-900/60 cursor-pointer transition-colors ${selectedStudent?.id === s.id ? 'bg-slate-900 border-l-2 border-brand-500' : ''}`}
                          >
                            <td className="p-4 space-y-1">
                              <span className="font-bold text-slate-100 block text-sm">{s.full_name}</span>
                              <span className="font-mono text-slate-400 block">{s.student_id}</span>
                            </td>
                            <td className="p-4 space-y-0.5">
                              <span className="block text-slate-300 font-semibold">{s.institution}</span>
                              <span className="block text-[10px] text-slate-500 font-mono">{s.institution_type}</span>
                            </td>
                            <td className="p-4 text-slate-300 font-semibold">{s.department}</td>
                            <td className="p-4 font-mono text-[11px] text-slate-400 space-y-0.5">
                              <span className="block">{s.email}</span>
                              <span className="block">{s.mobile}</span>
                            </td>
                            <td className="p-4">
                              {s.status === 'Pending' && <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold">Pending</span>}
                              {s.status === 'Approved' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">Approved</span>}
                              {s.status === 'Rejected' && <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2.5 py-1 rounded-full font-bold">Rejected</span>}
                            </td>
                            <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end space-x-2">
                                {s.status !== 'Approved' && (
                                  <button
                                    id={`row-approve-btn-${s.id}`}
                                    onClick={() => handleApprove(s.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg transition-colors"
                                    title="Approve immediately"
                                  >
                                    <UserCheck className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {s.status !== 'Rejected' && (
                                  <button
                                    id={`row-reject-btn-${s.id}`}
                                    onClick={() => {
                                      setSelectedStudent(s);
                                      setShowRejectModal(true);
                                    }}
                                    className="bg-slate-900 hover:bg-rose-500 hover:text-white text-slate-400 p-1.5 rounded-lg border border-slate-800 transition-all font-mono"
                                    title="Open reject options dialog"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sidebar Student credentials inspection drawer */}
              <div className="xl:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
                {selectedStudent ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-[9px] font-mono tracking-wider text-slate-500">INSPECT RECORD CREDENTIALS</span>
                        <h3 className="font-display font-extrabold text-sm text-white">STUDENT DOSSIER ROSTER</h3>
                      </div>
                      <button onClick={() => setSelectedStudent(null)} className="text-slate-500 hover:text-white font-mono text-xs">Close</button>
                    </div>

                    {/* visual picture and state badge */}
                    <div className="flex items-center space-x-4">
                      <img 
                        referrerPolicy="no-referrer"
                        src={selectedStudent.profile_picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} 
                        alt="Profile" 
                        className="h-16 w-16 rounded-xl object-cover border border-slate-800" 
                      />
                      <div className="space-y-1">
                        <span className="font-bold text-slate-100 block text-md leading-tight">{selectedStudent.full_name}</span>
                        <span className="font-mono text-slate-500 block text-xs">ID: {selectedStudent.student_id}</span>
                        <div className="pt-1">
                          {selectedStudent.status === 'Pending' && <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">Pending Review</span>}
                          {selectedStudent.status === 'Approved' && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Roster Verified</span>}
                          {selectedStudent.status === 'Rejected' && <span className="text-[10px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">Rejected Entry</span>}
                        </div>
                      </div>
                    </div>

                    {/* Action controllers */}
                    <div className="grid grid-cols-2 gap-4 border-y border-slate-900 py-4">
                      <button
                        id="drawer-approve-btn"
                        onClick={() => handleApprove(selectedStudent.id)}
                        disabled={selectedStudent.status === 'Approved' || isProcessingAction}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>APPROVE</span>
                      </button>
                      <button
                        id="drawer-reject-btn"
                        onClick={() => setShowRejectModal(true)}
                        disabled={selectedStudent.status === 'Rejected' || isProcessingAction}
                        className="bg-slate-900 border border-slate-800 hover:bg-rose-600 disabled:opacity-40 hover:text-white text-rose-500 text-xs py-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 font-bold"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>REJECT</span>
                      </button>
                    </div>

                    {/* Comprehensive Details tabs sections */}
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-1 text-xs">
                      {/* Personal group */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold border-b border-slate-900 pb-1">Personal Details</span>
                        <p className="text-slate-400">Father's Name: <span className="text-slate-200 font-semibold">{selectedStudent.fathers_name}</span></p>
                        <p className="text-slate-400">Mother's Name: <span className="text-slate-200 font-semibold">{selectedStudent.mothers_name}</span></p>
                        <p className="text-slate-400">DOB & Nationality: <span className="text-slate-200 font-semibold">{selectedStudent.dob} ({selectedStudent.nationality})</span></p>
                        <p className="text-slate-400">Blood Group: <span className="text-rose-400 font-mono font-bold">{selectedStudent.blood_group}</span></p>
                      </div>

                      {/* Academic group */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold border-b border-slate-900 pb-1">Academic Coordinates</span>
                        <p className="text-slate-400">Registration Number: <span className="text-slate-200 font-mono select-all font-semibold">{selectedStudent.registration_number}</span></p>
                        <p className="text-slate-400">Semester & Year: <span className="text-slate-200 font-semibold">{selectedStudent.semester} ({selectedStudent.session})</span></p>
                        <p className="text-slate-400">Roll/Index: <span className="text-slate-200 font-semibold font-mono">{selectedStudent.roll_number}</span></p>
                      </div>

                      {/* Contact & Addresses */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold border-b border-slate-900 pb-1">Addresses & Guardians</span>
                        <p className="text-slate-400 leading-relaxed">Present Address: <span className="text-slate-200 block mt-1 bg-slate-900 p-2 rounded-lg">{selectedStudent.present_address}</span></p>
                        <p className="text-slate-400 leading-relaxed">Permanent Address: <span className="text-slate-200 block mt-1 bg-slate-900 p-2 rounded-lg">{selectedStudent.permanent_address}</span></p>
                        <p className="text-slate-400">Guardian Information: <span className="text-slate-200 font-semibold">{selectedStudent.guardian_info}</span></p>
                        <p className="text-slate-400">Emergency Node: <span className="text-slate-200 font-mono font-bold block bg-slate-900 p-2 rounded-lg mt-1">{selectedStudent.emergency_contact}</span></p>
                      </div>

                      {/* Dynamic Fields values */}
                      {selectedStudent.custom_fields && Object.keys(selectedStudent.custom_fields).length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] text-indigo-400 font-mono uppercase block font-bold border-b border-slate-900 pb-1">Custom Injected Value Pairings</span>
                          {Object.entries(selectedStudent.custom_fields).map(([key, value]) => (
                            <p key={key} className="text-slate-400">
                              <span className="text-slate-500 font-mono">{key.replace('ext_', '').toUpperCase()}:</span>{" "}
                              <span className="text-emerald-400 font-semibold">{value?.toString() || 'None'}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
                    <AlertCircle className="h-8 w-8 text-slate-600" />
                    <span className="text-slate-500 text-xs block font-mono">SELECT A STUDENT FOR INTENSIVE INGESTION INSPECTION</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DYNAMIC FORM BUILDER PANEL */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form builder inputs */}
            <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
              <h3 className="font-display font-bold text-lg text-white border-b border-slate-900 pb-4">
                নতুন ক্ষেত্র যুক্ত করুন (Add Dynamic Field Injection)
              </h3>

              <form onSubmit={handleAddField} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-2">ইউনিক ক্ষেত্র কোড (System Key) *</label>
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                      <span className="text-slate-600 font-mono pr-1 select-none">ext_</span>
                      <input
                        required
                        type="text"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        placeholder="e.g. programming_skills"
                        className="w-full bg-transparent text-white font-mono focus:outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-1.5">No spaces, letters/underscores only. Kept inside database tables.</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-2">ডিসপ্লে লেবেল (Human Label) *</label>
                    <input
                      required
                      type="text"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      placeholder="যেমন: রক্তদান করতে আগ্রহী?"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-2">ইনপুট ধরণ (Input Type) *</label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-brand-600"
                    >
                      <option value="text">Text Input Line</option>
                      <option value="number">Numeric Counter</option>
                      <option value="dropdown">Dropdown Options</option>
                      <option value="radio">Radio Buttons Line</option>
                      <option value="checkbox">Selection Checkbox</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-2">ফর্ম ক্যাটাগরি স্থান (Form Placement Place) *</label>
                    <select
                      value={newFieldCategory}
                      onChange={(e) => setNewFieldCategory(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-brand-600"
                    >
                      <option value="personal">১. ব্যক্তিগত তথ্য (Personal)</option>
                      <option value="academic">২. প্রাতিষ্ঠানিক তথ্য (Academic)</option>
                      <option value="contact">৩. যোগাযোগের তথ্য (Contact)</option>
                      <option value="address">৪. ঠিকানা (Address)</option>
                      <option value="additional">৫. অতিরিক্ত তথ্য ও ফাইল আপলোড (Additional)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-2">ড্রপডাউন/রেডিও অপশনসমূহ (Separated by Commas)</label>
                    <input
                      type="text"
                      value={newFieldOptionsString}
                      onChange={(e) => setNewFieldOptionsString(e.target.value)}
                      placeholder="যেমন: Yes, No OR Sports, Music, Debate"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-600"
                    />
                    <span className="text-[10px] text-slate-500 block pt-1.5">Only required for dropdowns and radios selectors.</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-2">ইনপুট প্লেসহোল্ডার (Placeholder)</label>
                    <input
                      type="text"
                      value={newFieldPlaceholder}
                      onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                      placeholder="লিখুন..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-600"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <input
                      type="checkbox"
                      id="builder-required-chk"
                      checked={newFieldRequired}
                      onChange={(e) => setNewFieldRequired(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-900 text-brand-600 focus:ring-slate-800"
                    />
                    <label htmlFor="builder-required-chk" className="font-mono text-slate-300 font-bold cursor-pointer select-none uppercase">REQUIRED COMPULSORY FIELD</label>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-6 flex justify-end">
                  <button
                    id="submit-form-field-add-btn"
                    type="submit"
                    className="bg-brand-600 hover:bg-brand-700 text-white text-xs px-6 py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center space-x-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>আইনপুট ক্ষেত্র যুক্ত করুন</span>
                  </button>
                </div>
              </form>
            </div>

            {/* active dynamic fields template listing */}
            <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-xs uppercase font-mono tracking-widest font-bold text-indigo-400 border-b border-slate-900 pb-3 mb-4">
                Active Dynamic Form Fields ({db.dynamic_fields.length})
              </h4>

              {db.dynamic_fields.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No dynamic custom coordinates added. Use form builder panel left.</p>
              ) : (
                <div className="space-y-4">
                  {db.dynamic_fields.map(field => (
                    <div key={field.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start justify-between gap-4">
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-slate-100 block">{field.label} {field.required && <span className="text-rose-500 font-bold">*</span>}</span>
                        <p className="font-mono text-[10px] text-slate-500 block">KEY: {field.name}</p>
                        <p className="text-[10px] text-slate-400">Type: <span className="font-mono text-slate-300">{field.type}</span> | Group: <span className="font-mono text-slate-300">{field.category}</span></p>
                        {field.options && field.options.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {field.options.map(o => <span key={o} className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 font-mono">{o}</span>)}
                          </div>
                        )}
                      </div>
                      <button
                        id={`delete-field-btn-${field.id}`}
                        onClick={() => handleDeleteField(field.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-950 transition-colors"
                        title="Delete dynamic field layout"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MOCK INTEGRATIONS & CLOUD SYNC DESK */}
        {activeTab === 'integrations' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Sync settings configurator */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
                <h3 className="font-display font-extrabold text-white text-md border-b border-slate-900 pb-3 flex items-center space-x-2">
                  <Layers className="h-5 w-5 text-emerald-500" />
                  <span>Google Workspaces Cloud Integrations</span>
                </h3>

                <form onSubmit={handleSaveSettings} className="space-y-6 text-xs text-slate-300">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-2">Google Sheets Destination Endpoint URL</label>
                    <input
                      required
                      type="url"
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-[11px]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="space-y-1">
                      <span className="font-bold block text-slate-200">Bidirectional Google Sheets Handshake Sync</span>
                      <span className="text-[10px] text-slate-500 block">Synchronize student approval rosters into columns real-time.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={syncEnabled}
                      onChange={(e) => setSyncEnabled(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-900 text-brand-600 focus:ring-slate-800 h-4 w-4 shrink-0 transition-all cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="space-y-1">
                      <span className="font-bold block text-slate-200">Dispatched Gmail alert sequences</span>
                      <span className="text-[10px] text-slate-500 block">Dispatch SMTP automatic welcome alerts or rejection feedback to keys.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailEnabled}
                      onChange={(e) => setEmailEnabled(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-900 text-brand-600 focus:ring-slate-800 h-4 w-4 shrink-0 transition-all cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-2">Primary Admin Notifications Recipient Email Address</label>
                    <input
                      required
                      type="email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-[11px]"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      id="save-integration-settings-btn"
                      type="submit"
                      className="bg-brand-600 hover:bg-brand-700 text-white text-xs px-5 py-3 rounded-xl font-bold transition-all shadow-md"
                    >
                      ভেরিফাই ও সেটিংস সংরক্ষণ করুন
                    </button>
                  </div>
                </form>
              </div>

              {/* google sheet row sync ledger simulation status */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 uppercase">
                  <span className="text-xs font-mono font-bold text-slate-400">Google Sheet Virtual Active Roster Logs</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse" />
                    <span>Real-time Active</span>
                  </span>
                </div>

                <div className="overflow-x-auto text-[10px] font-mono">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-500">
                        <th className="p-2">STUDENT_ID</th>
                        <th className="p-2">FULL_NAME</th>
                        <th className="p-2">INSTITUTION</th>
                        <th className="p-2">EMAIL</th>
                        <th className="p-2 text-right">SYNCED_AT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {db.sheet_rows.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-600">No synchronized columns rows printed yet. Approve submissions.</td>
                        </tr>
                      ) : (
                        db.sheet_rows.map(row => (
                          <tr key={row.student_id} className="text-slate-400 hover:bg-slate-900/40">
                            <td className="p-2 font-bold text-slate-200">{row.student_id}</td>
                            <td className="p-2 truncate max-w-[120px]">{row.full_name}</td>
                            <td className="p-2 truncate max-w-[100px]">{row.institution}</td>
                            <td className="p-2 truncate max-w-[100px]">{row.email}</td>
                            <td className="p-2 text-right text-emerald-500">{new Date(row.synced_at).toLocaleTimeString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-slate-900 pt-3 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                  <span>Sync handshake latency: <strong className="text-emerald-400">~12ms</strong></span>
                  <a href={sheetUrl} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline flex items-center space-x-1">
                    <span>Google Sheets spreadsheet</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Generated Notification Email dispatch triggers simulation */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-xs uppercase font-mono tracking-widest font-bold text-slate-400 border-b border-slate-900 pb-3 mb-4 flex items-center space-x-2">
                <Mail className="h-4 w-4 text-indigo-400" />
                <span>Active Webhook Simulated Email Triggers History Logs ({db.notifications.length})</span>
              </h4>

              <div className="space-y-3 max-h-80 overflow-y-auto font-mono text-[11px] pr-2">
                {db.notifications.length === 0 ? (
                  <p className="text-center py-6 text-slate-600">No email logs printed yet.</p>
                ) : (
                  db.notifications.map((notif) => (
                    <div key={notif.id} className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-slate-500 text-[10px] border-b border-slate-850 pb-1.5 flex-wrap gap-2">
                        <span>DISPATCHED TO: <strong className="text-slate-300">{notif.recipient_email}</strong></span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${notif.type === 'AdminAlert' ? 'bg-amber-500/10 text-amber-500' : 'bg-brand-500/10 text-brand-400'}`}>{notif.type}</span>
                          <span className="text-emerald-500">✔ SENT SUCCESSFULLY (SMTP)</span>
                        </div>
                      </div>
                      <p className="text-slate-300 font-bold">Subject: {notif.subject}</p>
                      <pre className="text-slate-400 text-[10px] bg-slate-950 p-2.5 rounded-lg whitespace-pre-wrap font-mono leading-relaxed">{notif.body}</pre>
                      <span className="text-[9px] text-slate-500 block text-right">{new Date(notif.timestamp).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FORENSIC AUDITS & COMPLIANCE STATS */}
        {activeTab === 'audits' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-4 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-slate-400">Forensic Audit Trails</span>
                  <p className="text-slate-500 text-[11px] font-mono">Immutable audit trail tracker logs tracking system key events.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleClearAudits}
                    className="bg-slate-900 hover:bg-rose-600 border border-slate-800 text-xs px-3.5 py-2 font-mono rounded-lg hover:text-white transition-all text-slate-400"
                  >
                    Wipe Audit Logs
                  </button>
                  <button
                    onClick={handleResetDB}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3.5 py-2 font-mono rounded-lg transition-all"
                  >
                    Reset Full SIMS Database
                  </button>
                </div>
              </div>

              {/* logs display */}
              <div className="space-y-3 font-mono text-[11px] max-h-96 overflow-y-auto pr-2">
                {db.logs.length === 0 ? (
                  <p className="text-center py-6 text-slate-600">No logs captured as of 2026.</p>
                ) : (
                  db.logs.map((log) => (
                    <div key={log.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 flex items-start gap-4">
                      <span className="text-slate-600 shrink-0 font-bold">[{log.id.substring(0, 5)}]</span>
                      <div className="space-y-0.5 w-full">
                        <div className="flex justify-between items-center text-slate-400">
                          <strong className="text-slate-200">{log.action}</strong>
                          <span className="text-slate-600 text-[9px]">{new Date(log.timestamp).toLocaleTimeString()} • {log.actor}</span>
                        </div>
                        {log.details && <p className="text-slate-500 text-[10px]">{log.details}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Decision Logs validation list */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-xs uppercase font-mono tracking-widest font-bold text-slate-400 border-b border-slate-900 pb-3 mb-4">
                Decision verification logs ({db.approval_logs.length})
              </h4>
              <div className="font-mono text-[11px] divide-y divide-slate-900">
                {db.approval_logs.length === 0 ? (
                  <p className="text-slate-500 py-4">No approval logs listed.</p>
                ) : (
                  db.approval_logs.map(log => (
                    <div key={log.id} className="py-2.5 flex justify-between items-center flex-wrap gap-2 text-slate-400">
                      <span>
                        Student: <strong className="text-slate-300">{log.student_name} ({log.student_id})</strong> was{" "}
                        <span className={log.action === 'Approve' ? 'text-emerald-400 font-bold' : 'text-rose-500 font-bold'}>{log.action.toUpperCase()}D</span>
                        {log.reason && <span className="block text-[10px] text-slate-500 pl-4">{`"${log.reason}"`}</span>}
                      </span>
                      <span className="text-[10px] text-slate-600">{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()} • By: {log.admin_email}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ENTERPRISE ARCHITECTURE WIKI */}
        {activeTab === 'wiki' && (
          <div className="bg-slate-950 border border-slate-800 rounded-4xl p-6 md:p-10 shadow-2xl relative">
            <div className="absolute right-0 top-0 translate-x-20 -translate-y-10 w-96 h-96 rounded-full bg-brand-600/5 blur-3xl" />
            <div className="mx-auto max-w-4xl prose prose-invert prose-xs leading-relaxed text-slate-300 font-sans">
              <div className="markdown-body select-text">
                <Markdown>{TECHNICAL_DOCS}</Markdown>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Reject custom reason modal dialogue */}
      {showRejectModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">REJECTION CRITERIA SPECIFIER</span>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-white text-xs">Close</button>
            </div>

            <div className="text-xs space-y-1 text-slate-300">
              <h4 className="font-bold text-slate-200">Rejecting student: {selectedStudent.full_name}</h4>
              <p className="font-mono text-slate-500 text-[10px]">ID: {selectedStudent.student_id}</p>
            </div>

            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-2">
                  রিজেকশন কারণ (Reason for Rejection) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="যেমন: ছবি স্পষ্ট নয় অথবা একাডেমিক রোল নম্বরে ভুল পরিলক্ষিত হয়েছে। পুনরায় সংশোধন করুন।"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs font-bold pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="bg-slate-900 hover:bg-slate-855 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl"
                >
                  CANCEL
                </button>
                <button
                  id="submit-rejection-reason-btn"
                  type="submit"
                  disabled={isProcessingAction}
                  className="bg-rose-600 hover:bg-rose-700 hover:scale-[1.01] text-white px-5 py-2.5 rounded-xl transition-all shadow-md"
                >
                  {isProcessingAction ? 'Processing...' : 'SEND BANNER REJECTION DISPATCH'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
