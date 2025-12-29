
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ServiceEC2 } from './components/ServiceEC2';
import { ServiceS3 } from './components/ServiceS3';
import { ServiceIAM } from './components/ServiceIAM';
import { ServiceRDS } from './components/ServiceRDS';
import { ServiceLambda } from './components/ServiceLambda';
import { ServiceVPC } from './components/ServiceVPC';
import { ServiceBilling } from './components/ServiceBilling';
import { ServiceSupport } from './components/ServiceSupport';
import { ServiceVideoStreaming } from './components/ServiceVideoStreaming';
import { ServiceCDN } from './components/ServiceCDN';
import { ServiceAPIGateway } from './components/ServiceAPIGateway';
import { ServiceSecurityHub } from './components/ServiceSecurityHub';
import { ServiceWAF } from './components/ServiceWAF';
import { ServiceCloudWatch } from './components/ServiceCloudWatch';
import { ServiceDynamoDB } from './components/ServiceDynamoDB';
import { ServiceTranscoder } from './components/ServiceTranscoder';
import { ServicePersonalize } from './components/ServicePersonalize';
import { ServiceAppSync } from './components/ServiceAppSync';
import { AIAssistant } from './components/AIAssistant';
import { CloudShell } from './components/CloudShell';
import { Auth } from './components/Auth';
import { ServiceType, UserSession } from './types';
import { X, Lock, ShoppingCart, Sparkles } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ConsoleNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: ToastType;
  read: boolean;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const NotificationContext = createContext<{
  notifications: ConsoleNotification[];
  addNotification: (title: string, message: string, type: ToastType) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}>({
  notifications: [],
  addNotification: () => {},
  markAllRead: () => {},
  clearNotifications: () => {}
});

export const useNotifications = () => useContext(NotificationContext);

const SubscriptionGate: React.FC<{ service: ServiceType; onPurchase: () => void }> = ({ service, onPurchase }) => (
  <div className="flex flex-col items-center justify-center h-full bg-[#f8f9fa] p-8 text-center animate-in fade-in zoom-in-95">
    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-gray-100 mb-8 relative">
       <Lock size={32} className="text-gray-300" />
       <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-1.5 rounded-full shadow-lg">
          <Sparkles size={14} />
       </div>
    </div>
    <h2 className="text-2xl font-bold text-[#161e2d] mb-4">Subscription Required: {service}</h2>
    <p className="max-w-sm text-gray-500 text-sm mb-10">
      Your account is not yet authorized for <strong>{service}</strong> operations. Purchase the <strong>Global Engagement Pack</strong> to unlock these features.
    </p>
    <div className="w-full max-w-md bg-white p-6 border rounded-xl shadow-sm text-left">
       <div className="flex justify-between items-center mb-6">
          <p className="text-sm font-bold text-gray-700">Global Engagement Pack</p>
          <p className="text-xl font-black text-orange-600">$49.99 <span className="text-[10px] text-gray-400 font-normal italic">(Simulated)</span></p>
       </div>
       <button onClick={onPurchase} className="w-full py-3 bg-[#ec7211] text-white font-bold rounded shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center space-x-2">
          <ShoppingCart size={16} /><span>Unlock Content Intelligence</span>
       </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [currentView, setCurrentView] = useState<ServiceType>(ServiceType.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<ConsoleNotification[]>([
    { id: '1', title: 'System', message: 'Console initialized successfully.', time: new Date().toLocaleTimeString(), type: 'success', read: false }
  ]);

  const addNotification = (title: string, message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setNotifications(prev => [{ id, title, message, type, read: false, time: new Date().toLocaleTimeString() }, ...prev]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handlePurchase = (service: ServiceType) => {
    if (!session) return;
    const updatedPermissions = [...(session.permissions || []), service];
    const updatedSession = { ...session, permissions: updatedPermissions };
    
    const dbRaw = localStorage.getItem('streamx_cloud_database');
    if (dbRaw) {
      const db = JSON.parse(dbRaw);
      const idx = db.findIndex((u: any) => u.email === session.email);
      if (idx !== -1) {
        db[idx].permissions = updatedPermissions;
        localStorage.setItem('streamx_cloud_database', JSON.stringify(db));
      }
    }
    
    setSession(updatedSession);
    localStorage.setItem('cloud_console_session', JSON.stringify(updatedSession));
    addNotification('Billing', `Access for ${service} activated. High-availability resources online.`, 'success');
  };

  useEffect(() => {
    const saved = localStorage.getItem('cloud_console_session');
    if (saved) setSession(JSON.parse(saved));
    setIsAuthLoading(false);
  }, []);

  if (isAuthLoading) return null;
  if (!session) return <Auth onLogin={setSession} />;

  const hasPerm = (v: ServiceType) => session.role === 'admin' || v === ServiceType.DASHBOARD || session.permissions?.includes(v);

  const renderContent = () => {
    if (currentView !== ServiceType.DASHBOARD && !hasPerm(currentView)) {
      return <SubscriptionGate service={currentView} onPurchase={() => handlePurchase(currentView)} />;
    }
    switch (currentView) {
      case ServiceType.EC2: return <ServiceEC2 />;
      case ServiceType.S3: return <ServiceS3 />;
      case ServiceType.IAM: return <ServiceIAM />;
      case ServiceType.RDS: return <ServiceRDS />;
      case ServiceType.LAMBDA: return <ServiceLambda />;
      case ServiceType.VPC: return <ServiceVPC />;
      case ServiceType.BILLING: return <ServiceBilling />;
      case ServiceType.SUPPORT: return <ServiceSupport />;
      case ServiceType.VIDEO_STREAMING: return <ServiceVideoStreaming />;
      case ServiceType.CDN: return <ServiceCDN />;
      case ServiceType.API_GATEWAY: return <ServiceAPIGateway />;
      case ServiceType.SECURITY_HUB: return <ServiceSecurityHub />;
      case ServiceType.WAF: return <ServiceWAF />;
      case ServiceType.CLOUDWATCH_LOGS: return <ServiceCloudWatch />;
      case ServiceType.DYNAMODB: return <ServiceDynamoDB />;
      case ServiceType.TRANSCODER: return <ServiceTranscoder />;
      case ServiceType.AI_PERSONALIZATION: return <ServicePersonalize />;
      case ServiceType.REALTIME_CHAT: return <ServiceAppSync />;
      default: return <Dashboard onChangeView={setCurrentView} role={session.role} />;
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllRead: () => {}, clearNotifications: () => setNotifications([]) }}>
      <div className="min-h-screen bg-[#f2f3f3] flex flex-col">
        <Navbar 
          session={session} 
          onLogout={() => { localStorage.removeItem('cloud_console_session'); setSession(null); }} 
          onSearchRedirect={setCurrentView}
          onOpenTerminal={() => setIsTerminalOpen(true)}
        />
        <div className="flex flex-1 pt-[52px]">
          <Sidebar 
            currentView={currentView} onChangeView={setCurrentView} 
            isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            role={session.role} userPermissions={session.permissions || []}
          />
          <main className={`flex-1 transition-all relative overflow-hidden h-[calc(100vh-52px)] ${sidebarOpen ? 'ml-64' : 'ml-14'}`}>
            {renderContent()}
          </main>
        </div>
        <AIAssistant />
        <CloudShell isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} session={session} />
        <div className="fixed top-16 right-6 z-[1000] flex flex-col space-y-3 w-80 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto flex items-start p-4 rounded bg-white shadow-2xl border-l-4 border-orange-500 animate-in slide-in-from-right">
              <div className="flex-1 text-xs font-bold">{t.message}</div>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}><X size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};

export default App;
