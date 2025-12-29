
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Settings as SettingsIcon, 
  Grid, 
  HelpCircle, 
  LogOut, 
  User, 
  Hash, 
  Monitor, 
  Languages, 
  Keyboard, 
  Lock,
  ChevronRight,
  ChevronLeft,
  Check,
  Moon,
  Sun,
  Eye,
  ShieldCheck,
  Smartphone,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { UserSession } from './types';

interface NavbarProps {
  session: UserSession;
  onLogout: () => void;
}

type SettingTab = 'main' | 'display' | 'language' | 'shortcuts' | 'privacy';

export const Navbar: React.FC<NavbarProps> = ({ session, onLogout }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingTab>('main');
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>('light');
  const [language, setLanguage] = useState('English (US)');
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  const settingsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
        setTimeout(() => setActiveTab('main'), 200);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderSettingContent = () => {
    switch (activeTab) {
      case 'display':
        return (
          <div className="p-1">
            <button onClick={() => setActiveTab('main')} className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-gray-500 hover:text-[#ec7211] transition-colors">
              <ChevronLeft size={14} /> <span>Back to Settings</span>
            </button>
            <div className="mt-2 space-y-1">
              {[
                { id: 'light', label: 'Light Mode', icon: Sun },
                { id: 'dark', label: 'Dark Mode', icon: Moon },
                { id: 'high-contrast', label: 'High Contrast', icon: Eye },
              ].map((t) => (
                <button 
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/40 rounded-sm transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <t.icon size={16} className={theme === t.id ? 'text-[#ec7211]' : 'text-gray-500'} />
                    <span className={`text-sm ${theme === t.id ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{t.label}</span>
                  </div>
                  {theme === t.id && <Check size={14} className="text-[#ec7211]" />}
                </button>
              ))}
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="p-1">
            <button onClick={() => setActiveTab('main')} className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-gray-500 hover:text-[#ec7211] transition-colors">
              <ChevronLeft size={14} /> <span>Back to Settings</span>
            </button>
            <div className="mt-2 max-h-64 overflow-y-auto custom-scrollbar">
              {['English (US)', 'Hindi (India)', 'Spanish (ES)', 'French (FR)'].map((lang) => (
                <button 
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/40 rounded-sm transition-all"
                >
                  <span className={`text-sm ${language === lang ? 'font-bold text-[#ec7211]' : 'text-gray-600'}`}>{lang}</span>
                  {language === lang && <Check size={14} className="text-[#ec7211]" />}
                </button>
              ))}
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="p-1">
            <button onClick={() => setActiveTab('main')} className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-gray-500 hover:text-[#ec7211]">
              <ChevronLeft size={14} /> <span>Back to Settings</span>
            </button>
            <div className="mt-2 px-1 space-y-2">
              <div className="flex items-center justify-between px-4 py-3 bg-black/5 rounded-sm">
                <div className="flex items-center space-x-3 text-xs">
                  <Smartphone size={16} className={mfaEnabled ? 'text-green-600' : 'text-gray-400'} />
                  <div><p className="font-bold">MFA Status</p><p className="text-gray-500">{mfaEnabled ? 'Active' : 'Disabled'}</p></div>
                </div>
                <button onClick={() => setMfaEnabled(!mfaEnabled)} className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${mfaEnabled ? 'bg-green-600' : 'bg-gray-400'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${mfaEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
              <button onClick={() => alert("Settings updated!")} className="w-full py-2.5 mt-2 bg-[#ec7211] text-white text-xs font-bold rounded shadow-lg hover:shadow-orange-200 transition-all">Save Privacy Changes</button>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-1 space-y-1">
            {[
              { id: 'display', label: 'Display Preferences', icon: Monitor },
              { id: 'language', label: 'Language & Region', icon: Languages },
              { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
              { id: 'privacy', label: 'Privacy & Security', icon: Lock },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)} 
                className="w-full flex items-center justify-between px-3 py-3 hover:bg-white/50 group transition-all rounded-sm text-left border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={16} className="text-gray-500 group-hover:text-[#ec7211]" />
                  <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                </div>
                <ChevronRight size={14} className="text-gray-300" />
              </button>
            ))}
          </div>
        );
    }
  };

  return (
    <nav className="h-[52px] bg-[#232f3e] text-white flex items-center justify-between px-4 fixed w-full z-50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center cursor-pointer group">
          <div className="flex items-center">
            <div className="mr-2 flex items-center justify-center">
               <div className="w-7 h-7 bg-[#ec7211] rounded flex items-center justify-center font-bold text-white text-xs shadow-inner">SX</div>
            </div>
            <span className="text-xl font-extrabold tracking-tighter text-white">streamX</span>
          </div>
          <Grid size={20} className="text-gray-300 ml-6 hover:text-white cursor-pointer" />
          <span className="ml-2 font-bold text-sm hidden md:block">Services</span>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-4 hidden md:flex relative">
        <input 
          type="text" 
          placeholder="Search for services, features, and docs" 
          className="w-full h-8 px-3 rounded-sm bg-[#161e2d] border border-[#5d6a7d] text-sm text-gray-200 focus:outline-none focus:border-[#ec7211] focus:ring-1 focus:ring-[#ec7211] placeholder-gray-400"
        />
        <Search className="absolute right-2 top-1.5 text-gray-400" size={16} />
      </div>

      <div className="flex items-center space-x-5 text-gray-300 text-sm">
        <button className="hover:text-white" title="Notifications"><Bell size={18} /></button>
        <button className="hover:text-white" title="Support"><HelpCircle size={18} /></button>
        
        {/* Transparent Settings Dropdown */}
        <div className="relative" ref={settingsRef}>
          <button 
            onClick={() => { setIsSettingsOpen(!isSettingsOpen); setIsUserOpen(false); }}
            className={`p-1.5 rounded transition-all ${isSettingsOpen ? 'bg-white/10 text-white scale-110' : 'hover:text-white'}`} 
          >
            <SettingsIcon size={18} />
          </button>
          {isSettingsOpen && (
            <div className="absolute top-full right-0 mt-3 w-72 bg-white/60 backdrop-blur-md text-[#161e2d] shadow-[0_10px_40px_rgba(0,0,0,0.2)] rounded-lg border border-white/40 overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 bg-white/30 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-800">Console Settings</h3>
              </div>
              <div className="min-h-[220px] p-2">
                {renderSettingContent()}
              </div>
            </div>
          )}
        </div>
        
        {/* Transparent User Dropdown */}
        <div className="relative" ref={userRef}>
          <div 
            onClick={() => { setIsUserOpen(!isUserOpen); setIsSettingsOpen(false); }}
            className={`flex items-center space-x-2 cursor-pointer transition-all border-l border-gray-600/50 pl-4 h-8 ${isUserOpen ? 'text-white' : 'hover:text-white'}`}
          >
            <div className="flex flex-col items-end leading-tight mr-1">
               <span className="font-bold text-[#ec7211] flex items-center">
                 {session.username}
                 {session.role === 'admin' && <span className="ml-2 bg-red-900/40 text-red-100 text-[9px] px-1 rounded border border-red-700/50 font-normal uppercase">Root</span>}
               </span>
               <span className="text-[10px] text-gray-400 tracking-wide">ID: {session.accountId.substring(0, 8)}...</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isUserOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isUserOpen && (
            <div className="absolute top-full right-0 mt-3 w-64 bg-white/60 backdrop-blur-md text-[#161e2d] shadow-[0_10px_40px_rgba(0,0,0,0.2)] rounded-lg border border-white/40 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
               <div className="p-4 border-b border-gray-200 bg-white/30">
                  <div className="font-bold text-sm text-gray-800">{session.username}</div>
                  <div className="text-xs text-[#0073bb] font-medium">{session.email}</div>
                  <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500 font-mono">
                      <Hash size={12} className="text-gray-400" />
                      <span>{session.accountId}</span>
                  </div>
               </div>
               <div className="p-2 space-y-1">
                  <button className="w-full text-left px-3 py-2.5 hover:bg-white/40 text-xs font-semibold text-gray-700 rounded transition-all flex items-center space-x-2">
                    <User size={14} /> <span>Account Settings</span>
                  </button>
                  <div className="h-[1px] bg-gray-200/50 mx-2"></div>
                  <button 
                    onClick={() => { setIsUserOpen(false); onLogout(); }}
                    className="w-full text-left px-3 py-2.5 hover:bg-red-500/10 text-xs flex items-center space-x-3 text-red-600 font-bold transition-all rounded"
                  >
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </button>
               </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1 cursor-pointer hover:text-white transition-colors border-l border-gray-600/50 pl-4">
          <span className="text-[#ec7211] font-bold">Global</span>
        </div>
      </div>
    </nav>
  );
};
