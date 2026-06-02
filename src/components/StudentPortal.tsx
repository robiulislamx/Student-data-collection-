import React, { useState, useRef } from 'react';
import { GraduationCap, ArrowLeft, Send, ShieldAlert, Sparkles, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { DynamicField, InstitutionType, StudentSubmission } from '../types';

interface StudentPortalProps {
  dynamicFields: DynamicField[];
  onNavigate: (view: 'landing' | 'student-register' | 'status-check' | 'admin-login') => void;
  onSuccessSubmit: (submissionId: string) => void;
}

export default function StudentPortal({ dynamicFields, onNavigate, onSuccessSubmit }: StudentPortalProps) {
  // Core form states
  const [formData, setFormData] = useState({
    // Personal
    full_name: '',
    fathers_name: '',
    mothers_name: '',
    gender: 'Male',
    dob: '',
    blood_group: 'O+',
    nationality: 'Bangladeshi',
    // Academic
    institution: '',
    institution_type: 'University' as InstitutionType,
    division: 'Dhaka',
    department: '',
    session: '',
    semester: '1st Semester',
    roll_number: '',
    registration_number: '',
    student_id: '',
    // Contact
    mobile: '',
    alt_mobile: '',
    email: '',
    // Address
    present_address: '',
    permanent_address: '',
    // Additional
    national_id: '',
    birth_cert: '',
    guardian_info: '',
    emergency_contact: '',
  });

  const [profilePicture, setProfilePicture] = useState<string>('');
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, any>>({});
  
  // Math captcha state
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [captchaProblem] = useState(() => {
    const a = Math.floor(Math.random() * 9) + 2;
    const b = Math.floor(Math.random() * 9) + 2;
    return { num1: a, num2: b, sum: a + b };
  });

  const [errorPayload, setErrorPayload] = useState<{ Bengali: string; English: string } | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatar presets in case they don't upload a profile image
  const avatarPresets = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = (name: string, value: any) => {
    setCustomFieldsData(prev => ({ ...prev, [name]: value }));
  };

  // Convert uploaded files into base64 strings
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image file size should not exceed 2MB for bandwidth performance optimization.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorPayload(null);
    setCaptchaError(false);

    // Human Bot Validation check
    if (parseInt(captchaAnswer) !== captchaProblem.sum) {
      setCaptchaError(true);
      setIsSubmitting(false);
      return;
    }

    try {
      // Assemble full submission payload
      const registerPayload = {
        ...formData,
        profile_picture: profilePicture || avatarPresets[Math.floor(Math.random() * avatarPresets.length)],
        custom_fields: customFieldsData,
        bot_token: "HUMAN_OK"
      };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerPayload)
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.duplicate_prevention) {
          setErrorPayload({
            Bengali: result.message, // "আপনার তথ্য ইতোমধ্যে জমা দেওয়া হয়েছে"
            English: result.error // Duplicate description
          });
        } else {
          setErrorPayload({
            Bengali: "নিবন্ধনে একটি ত্রুটি ঘটেছে। দয়া করে তথ্য পুনরায় যাচাই করুন।",
            English: result.error || "Bad configuration payload."
          });
        }
      } else {
        setFormSuccess(result.submission.student_id);
        setTimeout(() => {
          onSuccessSubmit(result.submission.student_id);
        }, 2200);
      }
    } catch (err) {
      setErrorPayload({
        Bengali: "সার্ভারে সংযোগ করতে ব্যর্থ হয়েছে। ইন্টারনেট কানেকশন চেক করুন।",
        English: (err as Error).message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Top sticky portal bar */}
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
            <span className="font-display font-bold text-sm tracking-wide">STUDENT REGISTRATION</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        {/* Banner Card info */}
        <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden mb-8 shadow-lg shadow-slate-900/10">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-44 h-44 rounded-full bg-brand-600/10 blur-3xl" />
          <div className="relative z-10 space-y-3">
            <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">শিক্ষার্থী নিবন্ধন ডেস্ক</h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              আপনার সঠিক ব্যক্তিগত এবং প্রাতিষ্ঠানিক তথ্য নিখুঁতভাবে ইনপুট করুন। প্রতিটি তথ্য গুগল শীটে রিয়েল-টাইমে সেভ হবে। অসম্পূর্ণ বা ভুয়া আইডি/ছবি সরবরাহ করলে রেজিস্ট্রেশন বাতিল করা হবে।
            </p>
          </div>
        </div>

        {/* Dynamic Warning Message / State Trigger */}
        {formSuccess && (
          <div className="bg-emerald-500 text-white rounded-2xl p-6 mb-8 shadow-lg flex items-center space-x-4 animate-pulse">
            <CheckCircle className="h-10 w-10 shrink-0" />
            <div>
              <h3 className="font-bold text-lg">নিবন্ধন সম্পন্ন হয়েছে!</h3>
              <p className="text-sm text-emerald-50">আপনার স্টুডেন্ট আইডি: <span className="font-mono font-bold text-white text-base underline">{formSuccess}</span>। অ্যাডমিন পোর্টালে ভেরিফাইড হলে গুগল শীটে সিঙ্ক হবে।</p>
            </div>
          </div>
        )}

        {errorPayload && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mb-8 shadow-md flex items-start space-x-4">
            <ShieldAlert className="h-8 w-8 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-rose-800 text-md tracking-tight font-display text-lg">
                {errorPayload.Bengali}
              </h3>
              <p className="text-xs text-rose-500 font-mono">
                Security Flag Triggered: {errorPayload.English}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={executeSubmit} className="space-y-8">
          {/* Section 1: Personal info */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-brand-600" />
              <span>১. ব্যক্তিগত তথ্য (Personal Information)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">পূর্ণ নাম (বাংলা বা ইংরেজি) *</label>
                <input
                  required
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="যেমন: মাহমুদুর রহমান সিফাত"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">পিতার নাম *</label>
                <input
                  required
                  type="text"
                  name="fathers_name"
                  value={formData.fathers_name}
                  onChange={handleInputChange}
                  placeholder="পিতার নাম লিখুন"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">মাতার নাম *</label>
                <input
                  required
                  type="text"
                  name="mothers_name"
                  value={formData.mothers_name}
                  onChange={handleInputChange}
                  placeholder="মাতার নাম লিখুন"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">লিঙ্গ (Gender) *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">রক্তের গ্রুপ (Blood Group) *</label>
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">জন্ম তারিখ *</label>
                  <input
                    required
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">জাতীয়তা (Nationality) *</label>
                  <input
                    required
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Dynamic Injected Fields for Personal Category */}
              {dynamicFields.filter(f => f.category === 'personal').map(field => (
                <div key={field.id}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {field.label} {field.required ? '*' : '(Optional)'}
                  </label>
                  {field.type === 'dropdown' ? (
                    <select
                      required={field.required}
                      onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                    >
                      <option value="">Choose...</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'radio' ? (
                    <div className="flex items-center space-x-4 py-2.5">
                      {field.options?.map(opt => (
                        <label key={opt} className="inline-flex items-center text-sm space-x-2 text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name={field.name}
                            value={opt}
                            required={field.required}
                            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                            className="text-brand-600 focus:ring-brand-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      required={field.required}
                      type={field.type === 'number' ? 'number' : 'text'}
                      onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder || `${field.label} লিখুন`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Academic info */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              <span>২. প্রাতিষ্ঠানিক তথ্য (Academic Information)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">শিক্ষা প্রতিষ্ঠানের নাম *</label>
                <input
                  required
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  placeholder="যেমন: ঢাকা ইউনিভার্সিটি"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">শিক্ষা প্রতিষ্ঠানের ধরণ *</label>
                <select
                  name="institution_type"
                  value={formData.institution_type}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                >
                  <option value="School">School</option>
                  <option value="College">College</option>
                  <option value="Polytechnic">Polytechnic</option>
                  <option value="University">University</option>
                  <option value="Madrasa">Madrasa</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">বিভাগ (Division) *</label>
                  <select
                    name="division"
                    value={formData.division}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">বিভাগ / সাবজেক্ট (Department) *</label>
                  <input
                    required
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="যেমন: CSE, Science, BBA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">শিক্ষা বছর (Session) *</label>
                  <input
                    required
                    type="text"
                    name="session"
                    value={formData.session}
                    onChange={handleInputChange}
                    placeholder="যেমন: 2021-22"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">সেমিস্টার / বর্ষ *</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                  >
                    <option value="1st Semester">1st Semester / Year</option>
                    <option value="2nd Semester">2nd Semester / Year</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                    <option value="Graduate">Graduated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">রোল নম্বর (Roll Number) *</label>
                <input
                  required
                  type="text"
                  name="roll_number"
                  value={formData.roll_number}
                  onChange={handleInputChange}
                  placeholder="যেমন: 24"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">রেজিস্ট্রেশন নম্বর *</label>
                <input
                  required
                  type="text"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleInputChange}
                  placeholder="যেমন: 182749502"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 bg-amber-50 border border-amber-100 px-3 py-1 text-amber-800 rounded-md w-fit uppercase tracking-wider mb-2">
                  স্টুডেন্ট আইডি (Student ID) * - DUPLICATE PREVENTER KEY
                </label>
                <input
                  required
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  placeholder="যেমন: 202611024 (ইউনিক হতে হবে)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                />
              </div>

              {/* Dynamic Injected Fields for Academic Category */}
              {dynamicFields.filter(f => f.category === 'academic').map(field => (
                <div key={field.id}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {field.label} {field.required ? '*' : '(Optional)'}
                  </label>
                  {field.type === 'dropdown' ? (
                    <select
                      required={field.required}
                      onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                    >
                      <option value="">Choose...</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'radio' ? (
                    <div className="flex items-center space-x-4 py-2.5">
                      {field.options?.map(opt => (
                        <label key={opt} className="inline-flex items-center text-sm space-x-2 text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name={field.name}
                            value={opt}
                            required={field.required}
                            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                            className="text-brand-600 focus:ring-brand-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      required={field.required}
                      type={field.type === 'number' ? 'number' : 'text'}
                      onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder || `${field.label} লিখুন`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Contact info */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-rose-600" />
              <span>৩. যোগাযোগের তথ্য (Contact Information)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-rose-800 tracking-wider mb-2">
                  মোবাইল নম্বর (Mobile) * - DUPLICATE PREVENTER KEY
                </label>
                <input
                  required
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="যেমন: +8801712345678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">বিকল্প মোবাইল নম্বর </label>
                <input
                  type="tel"
                  name="alt_mobile"
                  value={formData.alt_mobile}
                  onChange={handleInputChange}
                  placeholder="বিকল্প নম্বর"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-rose-800 tracking-wider mb-2">
                  ইমেইল এড্রেস (Email Address) * - DUPLICATE PREVENTER KEY
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="যেমন: student@example.com (ইউনিক)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Address info */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>৪. ঠিকানা (Address Information)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">বর্তমান ঠিকানা (Present Address) *</label>
                <textarea
                  required
                  rows={3}
                  name="present_address"
                  value={formData.present_address}
                  onChange={handleInputChange}
                  placeholder="গ্রাম, ডাকঘর, থানা, জেলা লিখুন"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">স্থায়ী ঠিকানা (Permanent Address) *</label>
                <textarea
                  required
                  rows={3}
                  name="permanent_address"
                  value={formData.permanent_address}
                  onChange={handleInputChange}
                  placeholder="স্থায়ী ঠিকানা লিখুন (সরাসরি বর্তমান ঠিকানার মত হলে কপি করে লিখুন)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Additional Info */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-amber-600" />
              <span>৫. অতিরিক্ত তথ্য ও ফাইল আপলোড (Additional Info)</span>
            </h2>

            <div className="space-y-6">
              {/* Profile Picture conversion base64 module */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-display">
                  প্রোফাইল ছবি (Profile Picture URL / Base64 upload) *
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50">
                  <div className="h-20 w-20 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300 flex items-center justify-center relative">
                    {profilePicture ? (
                      <img referrerPolicy="no-referrer" src={profilePicture} alt="Uploaded profile" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                  <div className="space-y-2 text-center sm:text-left w-full">
                    <span className="block text-xs text-slate-400">Drag & Drop Image or Click Upload (Max 2MB format)</span>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-900 text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-black transition-all"
                      >
                        স্থানীয় ছবি সিলেক্ট করুন
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <span className="text-xs text-slate-400">অথবা নিচের ডেমো অবতার সিলেক্ট করুন:</span>
                    </div>
                    <div className="flex items-center space-x-2 justify-center sm:justify-start pt-1">
                      {avatarPresets.map((avatar, idx) => (
                        <img
                          id={`preset-avatar-${idx}`}
                          key={idx}
                          referrerPolicy="no-referrer"
                          src={avatar}
                          alt="preset"
                          onClick={() => setProfilePicture(avatar)}
                          className={`h-8 w-8 rounded-full cursor-pointer object-cover hover:scale-110 transition-all border-2 ${profilePicture === avatar ? 'border-brand-600 shadow-md scale-105' : 'border-transparent'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ন্যাশনাল আইডি কার্ড নম্বর (NID) - Optional</label>
                  <input
                    type="text"
                    name="national_id"
                    value={formData.national_id}
                    onChange={handleInputChange}
                    placeholder="জাতীয় পরিচয়পত্র নম্বর"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">জন্ম নিবন্ধন সার্টিফিকেট নম্বর - Optional</label>
                  <input
                    type="text"
                    name="birth_cert"
                    value={formData.birth_cert}
                    onChange={handleInputChange}
                    placeholder="জন্ম নিবন্ধন সার্টিফিকেট নম্বর"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">অভিভাবকের তথ্য (Guardian Information) *</label>
                  <input
                    required
                    type="text"
                    name="guardian_info"
                    value={formData.guardian_info}
                    onChange={handleInputChange}
                    placeholder="পেসাজীবী মহোদয়ের নাম, সম্পর্ক এবং পেশা"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">জরুরী যোগাযোগ বিবরণ (Emergency Contact) *</label>
                  <input
                    required
                    type="text"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleInputChange}
                    placeholder="যোগাযোগের নাম, সম্পর্ক এবং মোবাইল নম্বর"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                  />
                </div>

                {/* Dynamic fields inside additional info */}
                {dynamicFields.filter(f => f.category === 'additional').map(field => (
                  <div key={field.id}>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {field.label} {field.required ? '*' : '(Optional)'}
                    </label>
                    {field.type === 'dropdown' ? (
                      <select
                        required={field.required}
                        onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all"
                      >
                        <option value="">Choose...</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : field.type === 'radio' ? (
                      <div className="flex items-center space-x-4 py-2.5">
                        {field.options?.map(opt => (
                          <label key={opt} className="inline-flex items-center text-sm space-x-2 text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name={field.name}
                              value={opt}
                              required={field.required}
                              onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                              className="text-brand-600 focus:ring-brand-500"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        required={field.required}
                        type={field.type === 'number' ? 'number' : 'text'}
                        onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                        placeholder={field.placeholder || `${field.label} লিখুন`}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-brand-600 focus:outline-none transition-all"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Anti-Bot Shield & Form Submission Control */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 text-white space-y-6">
            <h3 className="font-display font-bold text-lg text-white flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-brand-500" />
              <span>নিরাপত্তা ভেরিফিকেশন (Mathematical Spam Shield)</span>
            </h3>
            <p className="text-xs text-slate-400">
              স্প্যাম প্রতিরোধে নিচের গাণিতিক সমস্যাটি সমাধান করুন:
            </p>

            <div className="flex items-center space-x-4 max-w-sm">
              <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl font-mono text-base tracking-widest text-emerald-400 font-bold">
                {captchaProblem.num1} + {captchaProblem.num2} = ?
              </div>
              <input
                required
                type="number"
                value={captchaAnswer}
                onChange={(e) => {
                  setCaptchaAnswer(e.target.value);
                  setCaptchaError(false);
                }}
                placeholder="উত্তর দিন"
                className="bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none text-white w-full"
              />
            </div>
            {captchaError && (
              <p className="text-xs text-rose-400 font-mono">ভুল উত্তর! দয়া করে সঠিক যোগফলটি লিখুন।</p>
            )}

            <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-slate-500 leading-relaxed font-mono max-w-md">
                By submitting this form, you acknowledge that all identity values undergo cryptographic multi-key filters. Intentional duplicates or false rosters are autolabelled as malicious threat indicators.
              </p>
              <button
                id="submit-register-form-btn"
                type="submit"
                disabled={isSubmitting}
                className={`bg-brand-600 hover:bg-brand-700 hover:scale-[1.02] text-white font-medium text-sm px-8 py-4 rounded-xl transition-all flex items-center space-x-2 shrink-0 shadow-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                    <span>প্রসেসিং হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>আবেদন সাবমিট করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
