import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Trash2, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { PriceAlert } from '@stock-market/shared-types';
import { formatCurrency } from '@stock-market/shared-utils';

export const AlertsPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAlert(id);
      setAlerts(alerts.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-12 text-center rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-4 max-w-lg mx-auto mt-12">
        <Bell className="w-12 h-12 text-blue-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Sign In to Manage Price Alerts</h2>
        <p className="text-xs text-slate-400">
          Get notified immediately when prices cross your defined thresholds.
        </p>
        <Link
          to="/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="p-5 rounded-2xl bg-[#151F30] border border-[#1E293B]">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-400" />
          Active Price Alerts
        </h1>
        <p className="text-xs text-slate-400">
          Automated trigger monitoring evaluates tick feeds continuously and dispatches real-time alerts.
        </p>
      </div>

      <div className="rounded-2xl bg-[#151F30] border border-[#1E293B] overflow-hidden">
        {alerts.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <p>You have no active price alerts configured.</p>
            <p className="text-slate-500">Go to any Stock Details page and click "Set Alert".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#111827] text-slate-400 text-[11px]">
                  <th className="py-3 px-4 font-semibold">Symbol</th>
                  <th className="py-3 px-4 font-semibold">Condition</th>
                  <th className="py-3 px-4 font-semibold">Target Price</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Created</th>
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/70">
                {alerts.map((al) => (
                  <tr key={al.id} className="hover:bg-[#1E293B]/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-white font-mono">
                      <Link to={`/stocks/${encodeURIComponent(al.symbol)}`} className="hover:text-blue-400">
                        {al.symbol}
                      </Link>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-300">
                      {al.condition === 'ABOVE' ? 'Crosses Above' : 'Drops Below'}
                    </td>

                    <td className="py-3 px-4 font-bold font-mono text-white">
                      {formatCurrency(al.targetPrice, al.symbol.includes('.NS') ? 'INR' : 'USD')}
                    </td>

                    <td className="py-3 px-4">
                      {al.triggered ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                          TRIGGERED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-semibold">
                          MONITORING
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {new Date(al.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(al.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
