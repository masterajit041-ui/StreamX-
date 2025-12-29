import React, { useState, useRef, useEffect } from 'react';
import { INITIAL_INSTANCES } from '../constants';
import { RefreshCw, Play, Square, Settings, Search, Plus, Tag, X, Trash2, AlertCircle, Rocket, Shield, Cpu, Zap, ChevronDown, AlertTriangle, ExternalLink, Globe, HardDrive, Activity } from 'lucide-react';
import { Instance } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock monitoring data
const generateMetricData = (baseValue: number, variance: number) => {
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 5}m`,
    value: Math.max(0, baseValue + (Math.random() - 0.5) * variance)
  }));
};

export const ServiceEC2: React.FC = () => {
  const [instances, setInstances] = useState<Instance[]>(INITIAL_INSTANCES);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailInstanceId, setDetailInstanceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [search, setSearch] = useState('');
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [isStateMenuOpen, setIsStateMenuOpen] = useState(false);
  const [tempTags, setTempTags] = useState<{ key: string; value: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const stateMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stateMenuRef.current && !stateMenuRef.current.contains(event.target as Node)) {
        setIsStateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSelection = (id: string, e?: React.MouseEvent) => {
    // If clicking the row (not the checkbox), show details
    if (e) {
      setDetailInstanceId(id);
    }
    
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const filteredInstances = instances.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.id.toLowerCase().includes(search.toLowerCase())
  );

  const detailInstance = instances.find(i => i.id === detailInstanceId);

  const startEditingTags = (instance: Instance) => {
    const currentTags = Object.entries(instance.tags || {}).map(([key, value]) => ({ key, value }));
    setTempTags(currentTags.length > 0 ? currentTags : [{ key: '', value: '' }]);
    setEditingTagsId(instance.id);
    setErrorMsg(null);
  };

  const addTagRow = () => {
    setTempTags([...tempTags, { key: '', value: '' }]);
    setErrorMsg(null);
  };

  const removeTagRow = (index: number) => {
    setTempTags(tempTags.filter((_, i) => i !== index));
    setErrorMsg(null);
  };

  const updateTagRow = (index: number, field: 'key' | 'value', value: string) => {
    const newTags = [...tempTags];
    newTags[index][field] = value;
    setTempTags(newTags);
    setErrorMsg(null);
  };

  const getDuplicateKeys = () => {
    const keys = tempTags.map(t => t.key.trim()).filter(k => k !== "");
    const seen = new Set();
    const duplicates = new Set();
    keys.forEach(k => {
      if (seen.has(k)) duplicates.add(k);
      seen.add(k);
    });
    return duplicates;
  };

  const saveTags = () => {
    if (!editingTagsId) return;
    
    const duplicates = getDuplicateKeys();
    if (duplicates.size > 0) {
      setErrorMsg(`Duplicate tag keys are not allowed: ${Array.from(duplicates).join(', ')}`);
      return;
    }

    const hasEmptyKeyWithVal = tempTags.some(t => !t.key.trim() && t.value.trim());
    if (hasEmptyKeyWithVal) {
      setErrorMsg("Tag keys cannot be empty if a value is provided.");
      return;
    }

    const tagObject: Record<string, string> = {};
    tempTags.forEach(t => {
      if (t.key.trim()) tagObject[t.key.trim()] = t.value.trim();
    });

    setInstances(prev => prev.map(inst => 
      inst.id === editingTagsId ? { ...inst, tags: tagObject } : inst
    ));
    setEditingTagsId(null);
    setErrorMsg(null);
  };

  const handleLaunchInstance = () => {
    const newId = `i-${Math.random().toString(16).slice(2, 18)}`;
    const newInstance: Instance = {
      id: newId,
      name: 'new-instance-' + instances.length,
      state: 'pending',
      type: 't3.micro',
      az: 'us-east-1a',
      publicIp: '-',
      tags: { 'CreatedBy': 'Console' }
    };
    setInstances([newInstance, ...instances]);
    setIsLaunchModalOpen(false);
    
    setTimeout(() => {
      setInstances(prev => prev.map(i => i.id === newId ? { ...i, state: 'running', publicIp: `3.23.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}` } : i));
    }, 3000);
  };

  const handleTerminateInstances = () => {
    setInstances(prev => prev.map(inst => 
      selectedIds.has(inst.id) ? { ...inst, state: 'terminated', publicIp: '-' } : inst
    ));
    setIsTerminateModalOpen(false);
    setSelectedIds(new Set());
    if (detailInstanceId && selectedIds.has(detailInstanceId)) {
        setDetailInstanceId(null);
    }
  };

  const handleStateAction = (newState: Instance['state']) => {
    setInstances(prev => prev.map(inst => 
      selectedIds.has(inst.id) ? { ...inst, state: newState } : inst
    ));
    setIsStateMenuOpen(false);
  };

  const duplicateKeys = getDuplicateKeys();

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-20">
        <div>
           <h1 className="text-2xl font-bold text-[#161e2d]">Instances</h1>
           <p className="text-sm text-gray-500">EC2 &gt; Instances</p>
        </div>
        <div className="flex space-x-3">
            <button 
              disabled={selectedIds.size !== 1}
              onClick={() => {
                const id = Array.from(selectedIds)[0];
                const inst = instances.find(i => i.id === id);
                if (inst) startEditingTags(inst);
              }}
              className="px-4 py-1.5 border border-gray-300 rounded text-sm font-bold text-[#161e2d] hover:bg-gray-50 bg-white shadow-sm disabled:opacity-50 flex items-center space-x-2"
            >
                <Tag size={16} />
                <span>Manage tags</span>
            </button>
            <button className="px-4 py-1.5 border border-gray-300 rounded text-sm font-bold text-[#161e2d] hover:bg-gray-50 bg-white shadow-sm">
                Connect
            </button>
            
            {/* Instance State Dropdown */}
            <div className="relative" ref={stateMenuRef}>
              <button 
                disabled={selectedIds.size === 0}
                onClick={() => setIsStateMenuOpen(!isStateMenuOpen)}
                className="px-4 py-1.5 border border-gray-300 rounded text-sm font-bold text-[#161e2d] hover:bg-gray-50 bg-white shadow-sm flex items-center space-x-2 disabled:opacity-50"
              >
                  <span>Instance state</span>
                  <ChevronDown size={14} />
              </button>
              {isStateMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg z-[120] py-1">
                  <button 
                    onClick={() => handleStateAction('running')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Play size={14} className="text-green-600" />
                    <span>Start instance</span>
                  </button>
                  <button 
                    onClick={() => handleStateAction('stopped')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Square size={14} className="text-gray-600" />
                    <span>Stop instance</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    onClick={() => {
                      setIsTerminateModalOpen(true);
                      setIsStateMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2"
                  >
                    <Trash2 size={14} />
                    <span>Terminate instance</span>
                  </button>
                </div>
              )}
            </div>

             <button 
                onClick={() => setIsLaunchModalOpen(true)}
                className="px-4 py-1.5 bg-[#ec7211] text-white rounded text-sm font-bold hover:bg-[#d66100] shadow-sm flex items-center"
             >
                <Plus size={16} className="mr-1" /> Launch instances
            </button>
        </div>
      </div>

      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300`}>
        {/* Filters Bar */}
        <div className="bg-white p-4 border-b border-gray-200 flex items-center space-x-4 shrink-0">
            <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Find instances by name, ID..." 
                    className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#ec7211] focus:border-[#ec7211] outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded" onClick={() => setInstances(INITIAL_INSTANCES)}><RefreshCw size={18} /></button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded"><Settings size={18} /></button>
        </div>

        {/* Table Container */}
        <div className={`overflow-auto flex-1 bg-white p-4`}>
            <div className="border border-gray-300 rounded overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 border-b border-gray-300 text-gray-600 uppercase text-xs sticky top-0 z-10">
                        <tr>
                            <th className="p-3 w-8"><input type="checkbox" onChange={(e) => {
                            if (e.target.checked) setSelectedIds(new Set(filteredInstances.map(i => i.id)));
                            else setSelectedIds(new Set());
                            }} /></th>
                            <th className="p-3 font-bold">Name</th>
                            <th className="p-3 font-bold">Instance ID</th>
                            <th className="p-3 font-bold">Instance State</th>
                            <th className="p-3 font-bold">Instance Type</th>
                            <th className="p-3 font-bold">Availability Zone</th>
                            <th className="p-3 font-bold">Public IPv4</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredInstances.map((instance) => (
                            <tr 
                                key={instance.id} 
                                className={`hover:bg-blue-50 cursor-pointer ${detailInstanceId === instance.id ? 'bg-blue-50 border-l-4 border-l-[#0073bb]' : selectedIds.has(instance.id) ? 'bg-blue-50/50' : ''}`}
                                onClick={(e) => toggleSelection(instance.id, e)}
                            >
                                <td className="p-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(instance.id)} onChange={() => toggleSelection(instance.id)} /></td>
                                <td className="p-3 font-medium text-[#0073bb] hover:underline">{instance.name}</td>
                                <td className="p-3 text-[#0073bb] font-mono text-xs">{instance.id}</td>
                                <td className="p-3">
                                    <div className="flex items-center space-x-2">
                                        {instance.state === 'running' && <Play size={14} className="text-green-500 fill-current" />}
                                        {instance.state === 'stopped' && <Square size={14} className="text-gray-500 fill-current" />}
                                        {instance.state === 'terminated' && <Square size={14} className="text-red-500 fill-current" />}
                                        {instance.state === 'pending' && <RefreshCw size={14} className="text-yellow-500 animate-spin" />}
                                        <span className={`capitalize ${instance.state === 'running' ? 'text-green-700' : instance.state === 'pending' ? 'text-yellow-700' : 'text-gray-600'}`}>{instance.state}</span>
                                    </div>
                                </td>
                                <td className="p-3">{instance.type}</td>
                                <td className="p-3">{instance.az}</td>
                                <td className="p-3">{instance.publicIp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Details Panel */}
        {detailInstanceId && detailInstance && (
            <div className="h-[400px] bg-white border-t border-gray-300 flex flex-col shrink-0 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-4">
                        <span className="font-bold text-gray-700">{detailInstance.id} ({detailInstance.name})</span>
                        <div className="flex items-center space-x-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                            <span className="capitalize">{detailInstance.state}</span>
                        </div>
                    </div>
                    <button onClick={() => setDetailInstanceId(null)} className="p-1 hover:bg-gray-200 rounded">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>
                
                {/* Tabs */}
                <div className="flex items-center border-b border-gray-200 px-4 space-x-6">
                    {['details', 'security', 'networking', 'storage', 'status-checks', 'monitoring', 'tags'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 text-sm font-bold capitalize transition-colors border-b-2 ${
                                activeTab === tab ? 'text-[#ec7211] border-[#ec7211]' : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                        >
                            {tab.replace('-', ' ')}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-auto p-6">
                    {activeTab === 'details' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Instance Summary</h4>
                                <dl className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <dt className="text-gray-500">Instance ID</dt>
                                        <dd className="font-mono text-[#0073bb]">{detailInstance.id}</dd>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <dt className="text-gray-500">Public IPv4 Address</dt>
                                        <dd className="text-[#0073bb]">{detailInstance.publicIp}</dd>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <dt className="text-gray-500">Private IPv4 Address</dt>
                                        <dd className="text-[#0073bb]">172.31.{Math.floor(Math.random()*255)}.{Math.floor(Math.random()*255)}</dd>
                                    </div>
                                </dl>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Instance Configuration</h4>
                                <dl className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <dt className="text-gray-500">Instance type</dt>
                                        <dd>{detailInstance.type}</dd>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <dt className="text-gray-500">Availability Zone</dt>
                                        <dd>{detailInstance.az}</dd>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <dt className="text-gray-500">IAM Role</dt>
                                        <dd className="text-gray-400">None</dd>
                                    </div>
                                </dl>
                            </div>
                             <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Operations</h4>
                                <div className="space-y-2">
                                    <button className="w-full text-left px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center justify-between">
                                        <span>View CloudWatch metrics</span>
                                        <ExternalLink size={14} className="text-gray-400" />
                                    </button>
                                    <button className="w-full text-left px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center justify-between">
                                        <span>Create image</span>
                                        <ExternalLink size={14} className="text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'monitoring' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold text-gray-700 flex items-center">
                                    <Activity size={16} className="mr-2 text-[#ec7211]" />
                                    CloudWatch Monitoring Metrics
                                </h4>
                                <span className="text-xs text-gray-500">Last 1 hour • 5m Period</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* CPU Utilization Chart */}
                                <div className="bg-white border border-gray-200 rounded p-4 h-64 flex flex-col">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-500">CPU Utilization (%)</span>
                                        <Settings size={14} className="text-gray-400 cursor-pointer" />
                                    </div>
                                    <div className="flex-1">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={generateMetricData(15, 10)}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="time" hide />
                                                <YAxis fontSize={10} axisLine={false} tickLine={false} unit="%" />
                                                <Tooltip 
                                                    contentStyle={{ fontSize: '10px', borderRadius: '4px' }}
                                                    labelStyle={{ fontWeight: 'bold' }}
                                                />
                                                <Line type="monotone" dataKey="value" stroke="#ec7211" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Network In Chart */}
                                <div className="bg-white border border-gray-200 rounded p-4 h-64 flex flex-col">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-500">Network In (Bytes)</span>
                                        <Globe size={14} className="text-gray-400 cursor-pointer" />
                                    </div>
                                    <div className="flex-1">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={generateMetricData(5000, 4000)}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="time" hide />
                                                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                                <Tooltip 
                                                    contentStyle={{ fontSize: '10px', borderRadius: '4px' }}
                                                />
                                                <Line type="monotone" dataKey="value" stroke="#0073bb" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Network Out Chart */}
                                <div className="bg-white border border-gray-200 rounded p-4 h-64 flex flex-col">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-500">Network Out (Bytes)</span>
                                        <HardDrive size={14} className="text-gray-400 cursor-pointer" />
                                    </div>
                                    <div className="flex-1">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={generateMetricData(3000, 2500)}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="time" hide />
                                                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                                <Tooltip 
                                                    contentStyle={{ fontSize: '10px', borderRadius: '4px' }}
                                                />
                                                <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tags' && (
                        <div>
                             <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Tags Assigned ({Object.keys(detailInstance.tags || {}).length})</h4>
                             <div className="border border-gray-200 rounded overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="p-3 font-bold text-gray-600">Key</th>
                                            <th className="p-3 font-bold text-gray-600">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {detailInstance.tags && Object.entries(detailInstance.tags).map(([k, v]) => (
                                            <tr key={k}>
                                                <td className="p-3">{k}</td>
                                                <td className="p-3">{v}</td>
                                            </tr>
                                        ))}
                                        {(!detailInstance.tags || Object.keys(detailInstance.tags).length === 0) && (
                                            <tr><td colSpan={2} className="p-6 text-center text-gray-400">No tags assigned</td></tr>
                                        )}
                                    </tbody>
                                </table>
                             </div>
                             <button 
                                onClick={() => startEditingTags(detailInstance)}
                                className="mt-4 px-4 py-1.5 border border-gray-300 rounded text-sm font-bold text-[#161e2d] hover:bg-gray-50 flex items-center space-x-2"
                             >
                                <Tag size={14} />
                                <span>Manage tags</span>
                             </button>
                        </div>
                    )}

                    {['security', 'networking', 'storage', 'status-checks'].includes(activeTab) && (
                        <div className="flex flex-col items-center justify-center h-full py-10 opacity-50 grayscale">
                            <Rocket size={48} className="mb-4 text-gray-300" />
                            <p className="text-lg font-bold text-gray-500 uppercase tracking-widest">{activeTab.replace('-', ' ')} View</p>
                            <p className="text-sm text-gray-400 mt-2">Enhanced details coming soon to simulator.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* Terminate Confirmation Modal */}
      {isTerminateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] px-4">
            <div className="bg-white rounded shadow-2xl w-full max-w-lg overflow-hidden border border-gray-300">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-[#161e2d] flex items-center space-x-2">
                        <AlertTriangle size={20} className="text-red-600" />
                        <span>Terminate instances?</span>
                    </h2>
                    <button onClick={() => setIsTerminateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="mb-4 text-sm text-gray-800">
                        Are you sure you want to terminate the following <strong>{selectedIds.size}</strong> instance(s)?
                    </div>
                    
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded mb-6 bg-gray-50">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-100 sticky top-0 border-b border-gray-200">
                                <tr>
                                    <th className="p-2 font-bold text-gray-500 uppercase">Name</th>
                                    <th className="p-2 font-bold text-gray-500 uppercase">Instance ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {instances.filter(i => selectedIds.has(i.id)).map(inst => (
                                    <tr key={inst.id}>
                                        <td className="p-2 font-medium">{inst.name}</td>
                                        <td className="p-2 font-mono">{inst.id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-red-50 border-l-4 border-red-600 p-4 flex items-start space-x-3">
                        <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
                        <div className="text-xs text-red-900 leading-relaxed">
                            <p className="font-bold">Important Warning</p>
                            <p>On an EBS-backed instance, the default response is for the root volume to be deleted when the instance is terminated. This action cannot be undone.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button 
                        onClick={() => setIsTerminateModalOpen(false)}
                        className="px-6 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 rounded border border-gray-300 bg-white"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleTerminateInstances}
                        className="px-6 py-2 text-sm font-bold bg-red-600 text-white rounded hover:bg-red-700 shadow-md"
                    >
                        Terminate
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Launch Confirmation Modal */}
      {isLaunchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] px-4">
            <div className="bg-white rounded shadow-2xl w-full max-w-xl overflow-hidden border border-gray-300">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-[#161e2d] flex items-center space-x-2">
                        <Rocket size={18} className="text-[#ec7211]" />
                        <span>Confirm instance launch</span>
                    </h2>
                    <button onClick={() => setIsLaunchModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6">
                    <p className="text-sm text-gray-700 mb-6 font-medium">
                        You are about to launch a new virtual server. Review the configuration summary below:
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded border border-gray-200">
                        <div className="flex items-start space-x-3">
                            <Cpu size={18} className="text-gray-500 mt-1" />
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Instance Type</p>
                                <p className="text-sm font-bold text-[#161e2d]">t3.micro</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Shield size={18} className="text-gray-500 mt-1" />
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Security Group</p>
                                <p className="text-sm font-bold text-[#161e2d]">default-sg-01</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Zap size={18} className="text-gray-500 mt-1" />
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Storage</p>
                                <p className="text-sm font-bold text-[#161e2d]">8 GiB (gp3)</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Tag size={18} className="text-gray-500 mt-1" />
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">AMI</p>
                                <p className="text-sm font-bold text-[#161e2d]">Amazon Linux 2023</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4 flex items-start space-x-3">
                        <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                        <div className="text-xs text-blue-900 leading-relaxed">
                            <p className="font-bold">Free Tier Eligible</p>
                            <p>This instance is eligible for the AWS Free Tier. You will be notified if your usage exceeds the free limit.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button 
                        onClick={() => setIsLaunchModalOpen(false)}
                        className="px-6 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 rounded border border-gray-300 bg-white"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleLaunchInstance}
                        className="px-6 py-2 text-sm font-bold bg-[#ec7211] text-white rounded hover:bg-[#d66100] shadow-md flex items-center space-x-2"
                    >
                        <span>Launch instance</span>
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Tag Management Modal */}
      {editingTagsId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold">Manage tags</h2>
              <button onClick={() => setEditingTagsId(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-sm text-gray-600 mb-4">
                A tag is a label that you assign to an AWS resource. Each tag consists of a key and an optional value.
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}
              
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-4 font-bold text-xs text-gray-500 uppercase">
                  <div className="col-span-5">Key</div>
                  <div className="col-span-5">Value</div>
                  <div className="col-span-2"></div>
                </div>
                
                {tempTags.map((tag, idx) => {
                  const isDuplicate = tag.key.trim() !== "" && duplicateKeys.has(tag.key.trim());
                  return (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5">
                        <input 
                          type="text" 
                          value={tag.key} 
                          onChange={(e) => updateTagRow(idx, 'key', e.target.value)}
                          placeholder="Key (e.g. Project)"
                          className={`w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-[#ec7211] outline-none transition-colors ${
                            isDuplicate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <div className="col-span-5">
                        <input 
                          type="text" 
                          value={tag.value} 
                          onChange={(e) => updateTagRow(idx, 'value', e.target.value)}
                          placeholder="Value (e.g. Phoenix)"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#ec7211] outline-none"
                        />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <button 
                          onClick={() => removeTagRow(idx)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                <button 
                  onClick={addTagRow}
                  className="mt-2 text-sm text-[#0073bb] font-bold hover:underline flex items-center"
                >
                  <Plus size={14} className="mr-1" /> Add new tag
                </button>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
              <button 
                onClick={() => setEditingTagsId(null)}
                className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={saveTags}
                className="px-4 py-2 text-sm font-bold bg-[#ec7211] text-white rounded hover:bg-[#d66100] shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
