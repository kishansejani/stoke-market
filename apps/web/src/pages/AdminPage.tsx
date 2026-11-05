import React, { useEffect, useState } from 'react';
import { Shield, Users, Key, DollarSign, Activity, Server, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '@stock-market/shared-utils';

export const AdminPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'providers' | 'logs'>('overview');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [s, u, p, l] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminProviders(),
        api.getAdminAuditLogs(),
      ]);

      setStats(s);
      setUsers(u);
      setProviders(p);
      setAuditLogs(l);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleSwitchProvider = async (providerId: string) => {
    try {
      await fetch('/api/v1/admin/providers/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('stoke_access_token')}`,
        },
        body: JSON.stringify({ providerId }),
      });
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-[#151F30] border border-[#1E293B]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">System Administration & Provider Controls</h1>
            <p className="text-xs text-slate-400">
              Manage platform operations, market data connectors, perpetual licenses, and audit trails.
            </p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="p-2 rounded-xl bg-[#0B1220] hover:bg-[#1E293B] text-slate-300 border border-[#1E293B]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-3 text-xs font-semibold">
        {(['overview', 'users', 'providers', 'logs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl capitalize transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-[#151F30] text-slate-400 hover:text-white border border-[#1E293B]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Metrics */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Total Registered Users</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-white">{stats.totalUsers}</p>
            <p className="text-[11px] text-emerald-400">Authentication & RBAC operational</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Active Licenses</span>
              <Key className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-white">{stats.totalLicenses}</p>
            <p className="text-[11px] text-slate-400">Multi-device hardware bound</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Revenue (INR)</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-white">
              {formatCurrency(stats.revenueINR / 100, 'INR', { compact: true })}
            </p>
            <p className="text-[11px] text-slate-400">One-time software sales</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Active Provider</span>
              <Server className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-sm font-bold font-mono text-white truncate">{stats.activeProvider}</p>
            <p className="text-[11px] text-emerald-400">WebSocket Broadcasting Active</p>
          </div>
        </div>
      )}

      {/* Provider Switcher Tab */}
      {activeTab === 'providers' && (
        <div className="p-6 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-5 text-xs">
          <div>
            <h2 className="text-sm font-bold text-white">Market Data Provider Adapter Architecture</h2>
            <p className="text-slate-400">
              Hot-swap market data sources without redeploying backend servers. Real provider feeds require active commercial credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {providers.map((p) => (
              <div
                key={p.providerId}
                className={`p-4 rounded-xl border space-y-3 ${
                  p.isActive
                    ? 'bg-blue-600/10 border-blue-500'
                    : 'bg-[#0B1220] border-[#1E293B]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{p.name}</span>
                  {p.isActive && (
                    <span className="px-2 py-0.5 rounded bg-blue-500 text-white text-[10px] font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="text-slate-400 space-y-1 text-[11px]">
                  <p>Type: {p.isMock ? 'High-Fidelity Mock Generator' : 'External Exchange Gateway'}</p>
                  <p>Provider Code: <span className="font-mono text-white">{p.providerId}</span></p>
                </div>

                {!p.isActive && (
                  <button
                    onClick={() => handleSwitchProvider(p.providerId)}
                    className="w-full py-2 rounded-lg bg-[#1E293B] hover:bg-blue-600 hover:text-white text-slate-200 font-semibold transition-colors"
                  >
                    Switch to this Provider
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="rounded-2xl bg-[#151F30] border border-[#1E293B] overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#111827] text-slate-400 text-[11px]">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Licenses</th>
                  <th className="py-3 px-4">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/70">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#1E293B]/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{u.firstName} {u.lastName}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px] font-semibold">
                        {u.roles?.[0] || 'FREE_USER'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{u.licenseCount}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl bg-[#151F30] border border-[#1E293B] overflow-hidden text-xs">
          <div className="p-4 border-b border-[#1E293B]">
            <h2 className="text-sm font-bold text-white">System Security & Administration Audit Trail</h2>
          </div>
          <div className="divide-y divide-[#1E293B]/70">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-[#1E293B]/50 transition-colors">
                <div>
                  <span className="font-bold text-blue-400 font-mono">{log.action}</span>
                  <span className="text-slate-400 ml-2">on {log.resource}</span>
                  <p className="text-[11px] text-slate-500 font-mono">{log.payload}</p>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono">
                  <span>by {log.user?.email}</span>
                  <p>{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
