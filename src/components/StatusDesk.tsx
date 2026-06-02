import React, { useState, useRef } from 'react';
import { ArrowLeft, Search, GraduationCap, Clock, CheckCircle, XCircle, FileText, RefreshCw, Send, Image as ImageIcon } from 'lucide-react';
import { StudentSubmission, DynamicField, InstitutionType } from '../types';

interface StatusDeskProps {
  submissions: StudentSubmission[];
  dynamicFields: DynamicField[];
  onNavigate: (view: 'landing' | 'student-register' | 'status-check' | 'admin-login') => void;
  onRefreshDB: () => void;
}

export default function StatusDesk({ submissions, dynamicFields, onNavigate, onRefreshDB }: StatusDeskProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubmission, setActiveSubmission] = useState<StudentSubmission | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Editing form panel states
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [editProfilePic, setEditProfilePic] = useState('');
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, any>>({});
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setSearchError('');
    setActiveSubmission(null);
    setIsEditing(false);

    const term = searchQuery.trim().toLowerCase();
    if (!term) {
      setSearchError('অনুগ্রহ করে স্টুডেন্ট আইডি, ইমেইল বা মোবাইল প্রবেশ করান।');
      return;
    }

    // Match criteria against Student ID, Email, or Mobile
    const match = submissions.find(s => {
      return s.student_id.toLowerCase() === term ||
             s.email.toLowerCase() === term ||
             s.mobile === term ||
             s.mobile.replace('+88', '') === term;
    });

    if (match) {
      setActiveSubmission(match);
      setEditFormData({ ...match });
      setEditProfilePic(match.profile_picture || '');
      setCustomFieldsData(match.custom_fields || {});
    } else {
      setSearchError('দুঃখিত! এই আইডি বা ইমেইল দিয়ে কোনো আবেদন পাওয়া যায়নি।');
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = (name: string, value: any) => {
    setCustomFieldsData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;
    setIsSubmittingUpdate(true);

    try {
      const updatedFields = {
        ...editFormData,
        profile_picture: editProfilePic,
        custom_fields: customFieldsData
      };

      const res = await fetch('/api/update-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: activeSubmission.id,
          updatedFields
        })
      });

      const result = await res.json();
      if (res.ok) {
        alert("আপনার তথ্য সফলভাবে সংশোধিত হয়েছে। পর্যালোচনার জন্য এটি পুনরায় পেন্ডিং অবস্থায় পাঠানো হয়েছে।");
        setIsEditing(false);
        onRefreshDB();
        // Update active view from server state response
        setActiveSubmission(result.submission);
      } else {
        alert(`ত্রুটি ঘটেছে: ${result.error}`);
      }
    } catch (err) {
      alert("সংযোগ স্থাপন করা যাচ্ছে না।");
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Top portal header spacer */}
      <div className="bg-white border-b border-slate-200 py-4 px-6 md:px-8 tracking-tight sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>হোমপেজ</span>
          </button>
          <div className="flex items-center space-x-2 text-slate-900">
            <GraduationCap className="h-5 w-5 text-brand-600" />
            <span className="font-display font-bold text-sm tracking-wide">STATUS & CORRECTIONS DESK</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-44 w-44 rounded-full bg-emerald-500/5 blur-3xl" />
          <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight mb-2">আবেদনের বর্তমান অবস্থা ও সংশোধন</h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            রেজিস্ট্রেশন করার পর আপনার স্টুডেন্ট আইডি, ইমেইল এড্রেস অথবা মোবাইল নম্বর প্রদান করে ড্রাফট আবেদনের বর্তমান অবস্থা পরীক্ষা করতে পারেন এবং কোনো সংশোধন থাকলে তা পরিবর্তন ও পুনরায় সাবমিট করতে পারেন।
          </p>

          {/* Search box controller layout */}
          <form onSubmit={handleSearch} className="mt-6 flex items-center gap-3">
            <div className="relative w-full">
              <Search className="h-5 w-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                required
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="স্টুডেন্ট আইডি, ইমেইল অথবা মোবাইল নম্বর প্রবেশ করান"
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-sm search-input font-mono focus:bg-slate-950 focus:border-emerald-500 focus:outline-none text-white transition-all"
              />
            </div>
            <button
              id="submit-status-check-btn"
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm px-6 py-3.5 rounded-2xl transition-all shadow-md shrink-0 flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">খুঁজুন</span>
            </button>
          </form>
        </div>

        {/* Verification matching display area */}
        {hasSearched && searchError && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-slate-500 shadow-sm space-y-3">
            <XCircle className="h-12 w-12 text-rose-500 mx-auto" />
            <h3 className="font-display font-bold text-lg text-slate-900">{searchError}</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              সঠিক ডাটা প্রবেশ করিয়েছেন কিনা তা অনুগ্রহপূর্বক মিলিয়ে দেখুন অথবা নতুন করে রেজিস্ট্রেশন ফর্মটি পূরণ করুন।
            </p>
          </div>
        )}

        {hasSearched && activeSubmission && !isEditing && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-800 text-lg font-mono">
                    #{activeSubmission.student_id.substring(0, 4)}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-900">{activeSubmission.full_name}</h3>
                    <p className="text-slate-400 text-xs font-mono">Registration Record ID: {activeSubmission.id}</p>
                  </div>
                </div>

                {/* Submissions Status custom badges rendering */}
                <div>
                  {activeSubmission.status === 'Pending' && (
                    <span className="inline-flex items-center space-x-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full font-semibold">
                      <Clock className="h-3.5 w-3.5 animate-pulse" />
                      <span>Pending Verification</span>
                    </span>
                  )}
                  {activeSubmission.status === 'Approved' && (
                    <span className="inline-flex items-center space-x-1.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full font-semibold">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Approved & Synced</span>
                    </span>
                  )}
                  {activeSubmission.status === 'Rejected' && (
                    <span className="inline-flex items-center space-x-1.5 text-xs bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1.5 rounded-full font-semibold">
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Rejected Application</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Central Details Card based on current validation state */}
              <div className="mt-6">
                {activeSubmission.status === 'Pending' && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center space-y-3">
                    <Clock className="h-10 w-10 text-amber-500 mx-auto" />
                    <h4 className="font-display font-bold text-slate-900">ভেরিফিকেশন অপেক্ষারত রয়েছে</h4>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
                      আপনার স্টুডেন্ট আইডিটি নিরাপত্তা ফিল্টার ও ডুপ্লিকেট চেকার সফলভাবে অতিক্রম করেছে। সিস্টেম অ্যাডমিনিস্ট্রেটর আপনার তথ্যাবলী যাচাই করে ভেরিফাইড করলেই অটোমেটিক জিমেইল বার্তা এবং গুগল স্প্রেডশীট আপডেট হবে।
                    </p>
                  </div>
                )}

                {activeSubmission.status === 'Approved' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl border border-slate-800">
                      <div className="absolute right-0 bottom-0 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl -z-10" />
                      
                      <div className="flex justify-between items-start border-b border-slate-800 pb-5 mb-6">
                        <div>
                          <span className="text-[9px] font-mono tracking-widest text-emerald-400 uppercase font-bold">STUDENT DIGITAL CARD RECEIPT</span>
                          <h4 className="font-display font-bold text-xl">SIMS VERIFIED ACCOUNT</h4>
                        </div>
                        <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                          ISSUED ACTIVE
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                        <img
                          referrerPolicy="no-referrer"
                          src={activeSubmission.profile_picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                          alt="Student visual portrait"
                          className="h-28 w-28 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                          <div>
                            <span className="text-[10px] uppercase font-mono block text-slate-500 font-bold">Full Name</span>
                            <span className="text-sm font-bold text-slate-200">{activeSubmission.full_name}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-mono block text-slate-500 font-bold">Student ID</span>
                            <span className="text-sm font-mono font-bold text-emerald-400">{activeSubmission.student_id}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-mono block text-slate-500 font-bold">Institution & Type</span>
                            <span className="text-sm font-semibold text-slate-300">{activeSubmission.institution} ({activeSubmission.institution_type})</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-mono block text-slate-500 font-bold">Department / Session</span>
                            <span className="text-sm text-slate-300">{activeSubmission.department} ({activeSubmission.session})</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-mono block text-slate-500 font-bold">Contact Email</span>
                            <span className="text-sm font-mono text-slate-300">{activeSubmission.email}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-mono block text-slate-500 font-bold">Present Address</span>
                            <span className="text-xs text-slate-400 line-clamp-1">{activeSubmission.present_address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Mock dynamic sheet validation footer stamp */}
                      <div className="border-t border-slate-800 mt-6 pt-5 flex items-center justify-between text-xs font-mono text-slate-500 flex-wrap gap-4">
                        <p>SECURE LEDGER CODE: <span className="text-slate-300">DU_SYNC_2026_VERIFICATION_AISTUDIO</span></p>
                        <p className="text-emerald-500 font-bold">Verified on {new Date(activeSubmission.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          window.print();
                        }}
                        className="bg-slate-900 hover:bg-slate-950 text-white font-medium text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center space-x-2"
                      >
                        <FileText className="h-4 w-4" />
                        <span>প্রিন্ট আইডি রিসিট (PDF)</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeSubmission.status === 'Rejected' && (
                  <div className="space-y-6">
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
                      <div className="flex items-start space-x-4">
                        <XCircle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <h4 className="font-display font-bold text-rose-900 leading-tight">আবেদনটি সফলভাবে রিজেক্ট করা হয়েছে</h4>
                          <p className="text-sm text-rose-700 leading-relaxed font-semibold">
                            রিজেকশন বিস্তারিত কারণ (Rejection Feedback):
                          </p>
                          <blockquote className="bg-white border-l-4 border-rose-500 px-4 py-3 rounded-r-xl italic text-xs text-rose-800 font-mono">
                            "{activeSubmission.rejection_reason || "নথিপত্র অসম্পূর্ণ প্রিমিয়াম ত্রুটি।"}"
                          </blockquote>
                          <p className="text-xs text-rose-500 leading-relaxed pt-2">
                            অ্যাডমিন প্যানেলের নির্দেশনাবলী অনুসরণ করে সংশোধন করতে নিচের সংশোধন বাটনে ক্লিক করুন। সংশোধন করার সাথে সাথে আবেদনটি অ্যাডমিনের নিকট পুনরায় পেন্ডিং অবস্থায় চলে যাবে এবং আপনি পুনরায় যাচাইয়ে অন্তর্ভূক্ত হবেন।
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center space-x-2"
                      >
                        <RefreshCw className="h-4 w-4 animate-spin-slow" />
                        <span>তথ্য সংশোধন ও পুনরায় সাবমিট করুন</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fully operational Update Request editing form details view */}
        {isEditing && editFormData && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800 font-display">আবেদন সংশোধন ফরম (Student correction form)</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-slate-400 hover:text-slate-600 transition-all border border-slate-200 py-1.5 px-3 rounded-lg"
              >
                বাতিল করুন
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">পূর্ণ নাম *</label>
                  <input
                    required
                    type="text"
                    name="full_name"
                    value={editFormData.full_name}
                    onChange={handleEditInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">পিতার নাম *</label>
                  <input
                    required
                    type="text"
                    name="fathers_name"
                    value={editFormData.fathers_name}
                    onChange={handleEditInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">মাতার নাম *</label>
                  <input
                    required
                    type="text"
                    name="mothers_name"
                    value={editFormData.mothers_name}
                    onChange={handleEditInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">শিক্ষা প্রতিষ্ঠানের নাম *</label>
                  <input
                    required
                    type="text"
                    name="institution"
                    value={editFormData.institution}
                    onChange={handleEditInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ডিপার্টমেন্ট / বিভাগ *</label>
                  <input
                    required
                    type="text"
                    name="department"
                    value={editFormData.department}
                    onChange={handleEditInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-rose-800 tracking-wider mb-2">মোবাইল নম্বর (Duplicate check key)</label>
                  <input
                    required
                    type="tel"
                    name="mobile"
                    value={editFormData.mobile}
                    onChange={handleEditInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-rose-800 tracking-wider mb-2">ইমেইল এড্রেস (Duplicate check key)</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">বর্তমান ঠিকানা *</label>
                  <textarea
                    required
                    rows={2}
                    name="present_address"
                    value={editFormData.present_address}
                    onChange={handleEditInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                {/* Profile Picture edits upload block */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">প্রোফাইল ছবি আপডেট</label>
                  <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <img referrerPolicy="no-referrer" src={editProfilePic} alt="profile" className="h-14 w-14 rounded-full object-cover border border-slate-300" />
                    <div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-950 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-black"
                      >
                        নতুন ছবি আপলোড করুন
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Injected fields check/re-edit for updates form */}
              {dynamicFields.length > 0 && (
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest">Dynamic Custom Fields (Injected)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dynamicFields.map(field => {
                      const currentVal = customFieldsData[field.name] || '';
                      return (
                        <div key={field.id}>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{field.label}</label>
                          {field.type === 'dropdown' ? (
                            <select
                              value={currentVal}
                              onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                            >
                              <option value="">Choose...</option>
                              {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={currentVal}
                              onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 pt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingUpdate}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-sm px-6 py-3 rounded-xl font-medium transition-all shadow-md flex items-center space-x-2"
                >
                  {isSubmittingUpdate ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                      <span>আপডেট করা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>সংশোধনী সংরক্ষণ ও পুনরায় সাবমিট করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
