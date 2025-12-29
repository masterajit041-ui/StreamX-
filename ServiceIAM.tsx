
import React, { useState, useEffect } from 'react';
import { Users, Trash2, Search, RefreshCw, AlertCircle, ShieldCheck, User as UserIcon } from 'lucide-react';

export const ServiceIAM: React.FC = () => {
  const [db, setDb] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const loadDb = () => {
    const raw = localStorage.getItem('aws_cloud_database');
    setDb(raw ? JSON.parse(raw) : []);
  };

  useEffect(() => {
    loadDb();
  }, []);

  const deleteUser = (email: string) => {
    const updated = db.filter(u => u.email !== email);
    localStorage.setItem('aws_cloud_database', JSON.stringify(updated));
    setDb(updated);
  };

  const clearDatabase = () => {
    if (confirm("Are you sure you want to delete ALL users from the database? This cannot be undone.")) {
      localStorage.removeItem('aws_cloud_database');
      setDb([]);
    }
  };

  const filteredDb = db.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#161e2d] flex items-center">
          <Users className="mr-2 text-[#ec7211]" />
          IAM - User Database
        </h1>
        <p className="text-gray-600 mt-1">Manage the identity database: view registered email IDs and passwords.</p>
        
        <div className="flex justify-between items-center mt-6">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users by email or name..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#ec7211] focus:border-[#ec7211] outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex space-x-3 ml-4">
            <button onClick={loadDb} className="p-2 text-gray-600 hover:bg-gray-100 rounded border border-gray-300">
              <RefreshCw size={20} />
            </button>
            <button 
              onClick={clearDatabase}
              className="px-4 py-2 border border-red-300 text-red-600 font-bold text-sm hover:bg-red-50 rounded flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Flush Database</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 overflow-auto">
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 flex items-start space-x-3">
          <AlertCircle size={20} className="text-blue-600 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-900 font-medium">
            This view simulates the internal user directory. In a real environment, passwords would be hashed and salt-encrypted.
          </p>
        </div>

        <div className="border border-gray-300 rounded overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-300 text-gray-600 font-bold uppercase text-xs">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email ID</th>
                <th className="p-4">Password</th>
                <th className="p-4">Role</th>
                <th className="p-4">Account ID</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDb.map((user, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-4 font-bold flex items-center space-x-2 text-[#0073bb]">
                    <UserIcon size={14} />
                    <span>{user.username}</span>
                  </td>
                  <td className="p-4 font-mono text-xs">{user.email}</td>
                  <td className="p-4 font-mono text-xs">
                    <span className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-700 blur-[2px] hover:blur-none transition-all cursor-help">
                      {user.password}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-100 text-gray-700 border-gray-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-gray-500">{user.accountId}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => deleteUser(user.email)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDb.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-gray-400">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No users found in database</p>
                    <p className="text-sm">Sign up a new account to see it appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
