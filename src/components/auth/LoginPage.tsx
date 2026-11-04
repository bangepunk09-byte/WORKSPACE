import React, { useState } from 'react';
import {
  LogIn,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Users,
  X,
  Check,
  ExternalLink,
  ShieldAlert,
  Building2,
  Sparkles,
  MessageSquare,
  CheckSquare
} from 'lucide-react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { User, UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { workspaceInfo, users, login, themeSettings, submitUserApprovalRequest } = useWorkspace();

  const [errorMsg, setErrorMsg] = useState('');
  const [googleTargetDept, setGoogleTargetDept] = useState('Technology & Engineering');
  const [inputGoogleEmail, setInputGoogleEmail] = useState('');
  const [inputGoogleName, setInputGoogleName] = useState('');

  // Modals & States
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Dynamic Card Radius & Accent Color aligned with Dashboard Theme Settings
  const getRadiusClass = (radius?: string) => {
    switch (radius) {
      case 'sharp': return 'rounded-none';
      case 'rounded': return 'rounded-xl';
      case 'smooth': return 'rounded-3xl';
      case 'pill': return 'rounded-[28px]';
      default: return 'rounded-2xl';
    }
  };

  const getOuterRadiusClass = (radius?: string) => {
    switch (radius) {
      case 'sharp': return 'rounded-none';
      case 'rounded': return 'rounded-2xl';
      case 'smooth': return 'rounded-[36px]';
      case 'pill': return 'rounded-[40px]';
      default: return 'rounded-[32px]';
    }
  };

  const getAccentClass = (accent?: string) => {
    switch (accent) {
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'purple': return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'amber': return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'navy-crimson': return 'bg-rose-700 hover:bg-rose-800 text-white';
      case 'royal-blue':
      default: return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const cardRadiusClass = getRadiusClass(themeSettings?.cardRadius);
  const outerRadiusClass = getOuterRadiusClass(themeSettings?.cardRadius);
  const accentButtonClass = getAccentClass(themeSettings?.accentColor);

  const handleQuickLogin = (user: User) => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      login(user);
    }, 200);
  };

  const handleGoogleLoginSubmit = async (customEmail?: string, customName?: string) => {
    setIsGoogleLoading(true);
    setErrorMsg('');

    try {
      const emailToUse = customEmail || inputGoogleEmail.trim();
      const nameToUse = customName || inputGoogleName.trim();

      if (emailToUse) {
        const emailLower = emailToUse.toLowerCase();
        const existing = users.find(u => u.email.toLowerCase() === emailLower);
        if (existing) {
          login(existing);
          setIsGoogleLoading(false);
          setShowGoogleModal(false);
          return;
        }

        const orgDomain = (workspaceInfo.orgDomain || 'asliri.id').toLowerCase().replace('@', '');
        const isCorpDomain = emailLower.endsWith('@' + orgDomain) || emailLower.endsWith('.' + orgDomain);

        if (isCorpDomain) {
          const baseUser = users[0];
          const newUser: User = {
            ...baseUser,
            id: 'usr_g_' + Date.now(),
            email: emailToUse,
            name: nameToUse || emailToUse.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random()*900000000)}?auto=format&fit=crop&w=256&h=256&q=80`,
            department: googleTargetDept || 'Technology & Engineering',
            position: 'Staff Anggota',
            role: 'employee',
            joinedDate: new Date().toISOString().split('T')[0],
            employeeId: 'EMP-' + Math.floor(2026000 + Math.random() * 9000),
            employmentType: 'Full-time'
          };
          login(newUser);
        } else {
          submitUserApprovalRequest({
            name: nameToUse || emailToUse.split('@')[0],
            email: emailToUse,
            department: googleTargetDept || 'Technology & Engineering',
            position: 'Staff Anggota'
          });
          alert('Akun Anda menggunakan domain eksternal (Gmail/dll). Permohonan akses telah dikirimkan ke Super Admin untuk persetujuan. Anda dapat masuk setelah disetujui.');
        }
        setIsGoogleLoading(false);
        setShowGoogleModal(false);
        return;
      }

      if (!auth) {
        const userEmailInput = prompt('Masukkan email Google Anda:') || '';
        if (!userEmailInput) {
          setIsGoogleLoading(false);
          return;
        }
        const nameInput = prompt('Masukkan nama lengkap Anda:') || userEmailInput.split('@')[0];
        handleGoogleLoginSubmit(userEmailInput, nameInput);
        return;
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) throw new Error('Google account email not found.');

      const emailLower = user.email.toLowerCase();
      const existing = users.find(u => u.email.toLowerCase() === emailLower);

      if (existing) {
        login({
          ...existing,
          name: user.displayName || existing.name,
          avatar: user.photoURL || existing.avatar,
        });
      } else {
        const orgDomain = (workspaceInfo.orgDomain || 'asliri.id').toLowerCase().replace('@', '');
        const isCorpDomain = emailLower.endsWith('@' + orgDomain) || emailLower.endsWith('.' + orgDomain);

        if (isCorpDomain) {
          const baseUser = users[0];
          const newGoogleUser: User = {
            ...baseUser,
            id: 'usr_g_' + user.uid,
            email: user.email,
            name: user.displayName || 'Google Workspace User',
            avatar: user.photoURL || baseUser.avatar,
            department: googleTargetDept || 'Technology & Engineering',
            position: 'Staff Anggota',
            role: 'employee',
            joinedDate: new Date().toISOString().split('T')[0],
            employeeId: 'EMP-' + Math.floor(2026000 + Math.random() * 9000),
            employmentType: 'Full-time'
          };
          login(newGoogleUser);
        } else {
          submitUserApprovalRequest({
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            department: googleTargetDept || 'Technology & Engineering',
            position: 'Staff Anggota',
            avatar: user.photoURL || undefined
          });
          alert('Akun Google Anda menggunakan domain eksternal. Permohonan akses telah dikirimkan ke Super Admin untuk persetujuan.');
        }
      }
      setShowGoogleModal(false);
    } catch (err: any) {
      console.error('Google Login Error:', err);
      setErrorMsg(err.message || 'Gagal masuk dengan Google. Silakan masukkan email Anda di bawah.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-screen flex-col justify-between p-0 m-0 bg-[#181a20] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Top Floating Controls */}
      <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-30 flex items-center gap-2">
        <ThemeToggle size="md" />
      </div>

      {/* MOBILE VIEW */}
      <div className={`block lg:hidden w-full max-w-md mx-auto bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 my-auto ${outerRadiusClass}`}>
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          {workspaceInfo.logoUrl ? (
            <img
              src={workspaceInfo.logoUrl}
              alt={workspaceInfo.name}
              className={`h-11 w-11 shrink-0 object-cover ring-2 ring-slate-200 shadow-sm dark:ring-slate-700 ${cardRadiusClass}`}
            />
          ) : (
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center bg-slate-950 text-white shadow-md ring-2 ring-slate-800 dark:bg-white dark:text-slate-950 ${cardRadiusClass}`}>
              <Building2 className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-950 font-sans dark:text-white uppercase truncate">
                {workspaceInfo.name || 'ASLI GROUP'}
              </span>
              <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700 border border-red-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800/60 shrink-0">
                HUB
              </span>
            </div>
            <p className="truncate text-xs text-slate-500 font-medium dark:text-slate-400">
              {workspaceInfo.tagline || 'Corporate Internal Platform'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className={`flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/60 dark:text-red-300 ${cardRadiusClass}`}>
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className={`flex w-full items-center justify-center gap-2.5 border border-slate-200 dark:border-slate-700 py-3.5 px-4 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-md ${cardRadiusClass}`}
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1 justify-center">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Secure Enterprise Google Workspace SSO</span>
          </div>
        </div>

        {/* Explore Demo Mode box */}
        <div className={`border border-amber-200/80 bg-amber-50/50 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/20 space-y-2.5 ${cardRadiusClass}`}>
          <div className="flex items-center gap-2">
            <span className="text-sm">🧪</span>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">Explore Demo Mode</h4>
              <p className="text-[10px] text-slate-500">Sample data — separate from real workspace.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {users.slice(0, 4).map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                className={`flex items-center gap-2 bg-white p-2 text-left border border-slate-200/80 hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900 transition cursor-pointer group text-xs ${cardRadiusClass}`}
              >
                <img src={u.avatar} alt={u.name} className="h-6 w-6 rounded-full object-cover shrink-0" />
                <span className="font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600">
                  {u.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DESKTOP SPLIT VIEW */}
      <div className="hidden lg:grid relative z-25 w-full flex-1 grid-cols-12 min-h-screen bg-white dark:bg-slate-900 overflow-hidden shadow-none rounded-none border-0">
        {/* LEFT COLUMN: Modern Building Image Banner with Features */}
        <div className="col-span-7 relative p-10 flex flex-col justify-between overflow-hidden text-white min-h-full">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url('${workspaceInfo.loginBgCustomUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85'}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />

          {/* Top Badge */}
          <div className="relative z-10 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md border border-white/15 ${cardRadiusClass}`}>
              <Sparkles className="h-3 w-3 text-red-400" />
              <span>{workspaceInfo.loginBannerBadge || 'Your Team. One Circle.'}</span>
            </span>
          </div>

          {/* Middle/Top Content Area */}
          <div className="relative z-10 py-6 max-w-lg mt-auto">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug">
              Connect people. Move work forward.
            </h1>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              One workspace to connect your people, manage your work, and keep everything moving.
            </p>
          </div>

          {/* Bottom 3 Feature Cards */}
          <div className="relative z-10 grid grid-cols-3 gap-3 pt-3">
            <div className={`bg-white/90 backdrop-blur-md p-3.5 text-slate-900 shadow-lg flex flex-col justify-between ${cardRadiusClass}`}>
              <div className={`flex h-7 w-7 items-center justify-center bg-red-50 text-red-600 mb-2 ${cardRadiusClass}`}>
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 leading-snug">Chat & calls</span>
            </div>

            <div className={`bg-white/90 backdrop-blur-md p-3.5 text-slate-900 shadow-lg flex flex-col justify-between ${cardRadiusClass}`}>
              <div className={`flex h-7 w-7 items-center justify-center bg-red-50 text-red-600 mb-2 ${cardRadiusClass}`}>
                <CheckSquare className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 leading-snug">Tasks & projects</span>
            </div>

            <div className={`bg-white/90 backdrop-blur-md p-3.5 text-slate-900 shadow-lg flex flex-col justify-between ${cardRadiusClass}`}>
              <div className={`flex h-7 w-7 items-center justify-center bg-red-50 text-red-600 mb-2 ${cardRadiusClass}`}>
                <Users className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 leading-snug">People & org</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Google SSO & Demo Mode */}
        <div className="col-span-5 p-10 lg:p-12 flex flex-col justify-between bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
          <div className="max-w-sm w-full mx-auto my-auto space-y-6">
            <div className="space-y-3">
              {/* Integrated Sidebar Brand Header Matching Dashboard */}
              <div className="flex items-center gap-3 overflow-hidden">
                {workspaceInfo.logoUrl ? (
                  <img
                    src={workspaceInfo.logoUrl}
                    alt={workspaceInfo.name}
                    className={`h-11 w-11 shrink-0 object-cover ring-2 ring-slate-200 shadow-sm dark:ring-slate-700 ${cardRadiusClass}`}
                  />
                ) : (
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center bg-slate-950 text-white shadow-md ring-2 ring-slate-800 dark:bg-white dark:text-slate-950 ${cardRadiusClass}`}>
                    <Building2 className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-extrabold tracking-tight text-slate-950 font-sans dark:text-white uppercase truncate">
                      {workspaceInfo.name || 'ASLI GROUP'}
                    </span>
                    <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700 border border-red-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800/60 shrink-0">
                      HUB
                    </span>
                  </div>
                  <p className="truncate text-xs text-slate-500 font-medium dark:text-slate-400">
                    {workspaceInfo.tagline || 'Corporate Internal Platform'}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Welcome back
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Biometrics for a Smarter Future
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className={`flex items-center gap-2 border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/60 dark:text-red-300 ${cardRadiusClass}`}>
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google Single Sign-On Button */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className={`flex w-full items-center justify-center gap-2.5 border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 py-3.5 px-4 text-xs font-bold text-slate-800 dark:text-white shadow-sm transition cursor-pointer group ${cardRadiusClass}`}
              >
                <svg className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Masuk dengan akun Google Anda sendiri.</span>
              </div>
            </div>

            {/* Explore Demo Mode box */}
            <div className={`border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 space-y-3 ${cardRadiusClass}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm">🧪</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Explore Demo Mode</h4>
                  <p className="text-[10px] text-slate-500">Sample data — separate from real workspace.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {users.slice(0, 4).map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className={`flex items-center gap-2 bg-white p-2 text-left border border-slate-200/80 hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900 transition cursor-pointer group text-xs ${cardRadiusClass}`}
                  >
                    <img src={u.avatar} alt={u.name} className="h-7 w-7 rounded-full object-cover shrink-0" />
                    <span className="font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600">
                      {u.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 text-center text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
            Apps ini di kembangkan oleh Team Marketing Asli Rancangan Indonesia
          </div>
        </div>
      </div>

      {/* FOOTER BAR FOR MOBILE */}
      <footer className="block lg:hidden w-full bg-slate-950 py-3 text-center text-[11px] text-slate-400 border-t border-slate-800 shrink-0 font-medium">
        Apps ini di kembangkan oleh Team Marketing Asli Rancangan Indonesia
      </footer>

      {/* Google Workspace Login Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className={`w-full max-w-md bg-white border border-slate-200 p-6 shadow-2xl dark:bg-slate-900 dark:border-slate-800 dark:text-white space-y-4 ${outerRadiusClass}`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-bold">Google Workspace SSO</h3>
              </div>
              <button type="button" onClick={() => setShowGoogleModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Masukkan akun Google Anda sendiri untuk masuk ke {workspaceInfo.name || 'Workspace'}:
            </p>

            <form onSubmit={e => { e.preventDefault(); handleGoogleLoginSubmit(); }} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Google Anda
                </label>
                <input
                  type="email"
                  required
                  value={inputGoogleEmail}
                  onChange={e => setInputGoogleEmail(e.target.value)}
                  placeholder="namaanda@gmail.com / kantor.id"
                  className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardRadiusClass}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Anda
                </label>
                <input
                  type="text"
                  required
                  value={inputGoogleName}
                  onChange={e => setInputGoogleName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardRadiusClass}`}
                />
              </div>

              {/* Division Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Divisi Penugasan
                </label>
                <select
                  value={googleTargetDept}
                  onChange={e => setGoogleTargetDept(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer ${cardRadiusClass}`}
                >
                  <option value="Technology & Engineering">Technology & Engineering</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="HRGA">HRGA</option>
                  <option value="Marketing & Brand">Marketing & Brand</option>
                  <option value="Finance & Legal">Finance & Legal</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGoogleLoading || !inputGoogleEmail.trim()}
                  className={`w-full py-3 text-xs font-bold shadow-md transition cursor-pointer ${accentButtonClass} ${cardRadiusClass}`}
                >
                  {isGoogleLoading ? 'Memproses...' : 'Masuk dengan Akun Google Saya'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
