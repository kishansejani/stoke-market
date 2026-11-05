import React, { useEffect, useState } from 'react';
import { Sparkles, Check, Laptop, Smartphone, Monitor, ShieldCheck, Key, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { ProductPackage, License, DeviceActivation } from '@stock-market/shared-types';
import { formatCurrency } from '@stock-market/shared-utils';

export const StorePage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [products, setProducts] = useState<ProductPackage[]>([]);
  const [myLicenses, setMyLicenses] = useState<License[]>([]);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [loading, setLoading] = useState(true);

  // Checkout modal
  const [selectedProduct, setSelectedProduct] = useState<ProductPackage | null>(null);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [successLicenseKey, setSuccessLicenseKey] = useState<string | null>(null);

  // License manual activation modal
  const [manualKey, setManualKey] = useState('');
  const [deviceName, setDeviceName] = useState('My Workstation');
  const [activationMessage, setActivationMessage] = useState<string | null>(null);

  const loadStoreData = async () => {
    setLoading(true);
    try {
      const prods = await api.getProducts();
      setProducts(prods);

      if (isAuthenticated) {
        const lics = await api.getMyLicenses();
        setMyLicenses(lics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, [isAuthenticated]);

  const handleCheckout = async (prod: ProductPackage) => {
    if (!isAuthenticated) {
      alert('Please sign in or create an account before checking out your license.');
      return;
    }

    setSelectedProduct(prod);
    setProcessingOrder(true);
    try {
      // 1. Create Order
      const checkoutRes = await api.checkoutOrder(prod.id, currency, 'MOCK_SANDBOX');

      // 2. Verify Payment (simulated sandbox gateway)
      const order = await api.verifyPayment({
        orderId: checkoutRes.orderId,
        gateway: 'MOCK_SANDBOX',
        paymentId: `pay_sandbox_${Date.now()}`,
      });

      setSuccessLicenseKey(order.licenseKey || 'STK-PRO-SUCCESS');
      await loadStoreData();
    } catch (err: any) {
      alert(err.message || 'Payment simulation failed');
    } finally {
      setProcessingOrder(false);
    }
  };

  const handleActivateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualKey.trim()) return;

    try {
      const res = await api.activateLicense({
        licenseKey: manualKey.trim(),
        deviceId: `dev_${navigator.userAgent.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`,
        os: 'web',
        deviceName: deviceName.trim(),
      });

      setActivationMessage(`Success! License active. Cloud data feed remaining: ${res.daysRemainingData} days.`);
      loadStoreData();
    } catch (err: any) {
      setActivationMessage(err.message || 'Activation failed');
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Commercial One-Time Purchase Software Model</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Perpetual Financial Terminal Licenses
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Say goodbye to recurring subscription churn. Purchase once, run forever across your devices, with 1 full year of included high-speed market data connectors.
        </p>

        {/* Currency Selector */}
        <div className="inline-flex p-1 rounded-xl bg-[#151F30] border border-[#1E293B] text-xs">
          <button
            onClick={() => setCurrency('INR')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
              currency === 'INR' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ₹ INR (India)
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
              currency === 'USD' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            $ USD (Global)
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((pkg) => {
          const price = currency === 'INR' ? pkg.priceINR / 100 : pkg.priceUSD / 100;
          return (
            <div
              key={pkg.id}
              className={`p-6 sm:p-8 rounded-3xl bg-[#151F30] border flex flex-col justify-between transition-all relative ${
                pkg.isPopular
                  ? 'border-blue-500 shadow-2xl shadow-blue-500/10 ring-1 ring-blue-500'
                  : 'border-[#1E293B]'
              }`}
            >
              {pkg.isPopular && (
                <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{pkg.tagline}</p>
                </div>

                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-extrabold font-mono text-white">
                    {formatCurrency(price, currency, { decimals: 0 })}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ one-time perpetual</span>
                </div>

                <div className="pt-2 pb-4 border-t border-b border-[#1E293B] space-y-2.5 text-xs">
                  <p className="font-semibold text-slate-300">Included Specifications:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{pkg.maxActivations} Concurrent Device Activations (Web, iOS, Android, Desktop)</span>
                    </li>
                    <li className="flex items-center space-x-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{pkg.dataIncludedDays} Days included Real-Time Cloud Data Gateway</span>
                    </li>
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-center space-x-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleCheckout(pkg)}
                  disabled={processingOrder}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {processingOrder && selectedProduct?.id === pkg.id
                    ? 'Processing Order & Generating License...'
                    : `Purchase One-Time License (${formatCurrency(price, currency, { decimals: 0 })})`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Success Order Confirmation Banner */}
      {successLicenseKey && (
        <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
            <h3 className="text-base font-bold text-white">Order Completed & License Key Provisioned!</h3>
          </div>
          <p className="text-slate-200">
            Your cryptographic software license is ready. Enter this key on any supported device to unlock real-time financial capabilities.
          </p>
          <div className="p-3 bg-[#0B1220] rounded-xl border border-emerald-500/30 font-mono text-sm font-bold text-emerald-400 flex items-center justify-between">
            <span>{successLicenseKey}</span>
            <span className="text-[10px] text-slate-400 font-sans">HMAC-SHA256 Signed</span>
          </div>
        </div>
      )}

      {/* Active User Licenses & Device Management */}
      {isAuthenticated && myLicenses.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-5">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">My Active Software Licenses & Device Seats</h2>
          </div>

          <div className="space-y-4">
            {myLicenses.map((lic) => (
              <div key={lic.id} className="p-4 rounded-xl bg-[#0B1220] border border-[#1E293B] space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-2">
                  <div>
                    <span className="font-bold text-white text-sm">{lic.productName}</span>
                    <p className="font-mono text-blue-400 font-semibold">{lic.licenseKey}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-semibold self-start sm:self-auto">
                    {lic.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-400 text-[11px]">
                  <div>
                    <span>Device Seats: </span>
                    <strong className="text-white font-mono">{lic.activeDevices.length} / {lic.maxDevices} Active</strong>
                  </div>
                  <div>
                    <span>Included Cloud Data Until: </span>
                    <strong className="text-white font-mono">{new Date(lic.dataAccessExpiry).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span>Software Access: </span>
                    <strong className="text-emerald-400 font-semibold">Perpetual Lifetime</strong>
                  </div>
                </div>

                {lic.activeDevices.length > 0 && (
                  <div className="pt-2 space-y-1.5">
                    <p className="text-slate-400 text-[11px] font-semibold">Registered Hardware Devices:</p>
                    <div className="flex flex-wrap gap-2">
                      {lic.activeDevices.map((dev) => (
                        <div key={dev.deviceId} className="px-2.5 py-1 rounded-lg bg-[#151F30] border border-[#1E293B] flex items-center space-x-2 text-[11px]">
                          <Monitor className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-200 font-medium">{dev.deviceName}</span>
                          <span className="text-slate-500 text-[9px] uppercase">({dev.os})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual License Activation Form */}
      <div className="p-6 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-4 max-w-xl mx-auto text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Activate License on This Device
        </h3>
        <p className="text-slate-400">
          Already purchased a perpetual license key? Bind your device slot below.
        </p>

        {activationMessage && (
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs">
            {activationMessage}
          </div>
        )}

        <form onSubmit={handleActivateDevice} className="space-y-3">
          <input
            type="text"
            placeholder="STK-PRO-XXXX-XXXX-XXXX"
            value={manualKey}
            onChange={(e) => setManualKey(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[#0B1220] border border-[#1E293B] text-white font-mono focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Device Name (e.g. Home Desktop PC)"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[#0B1220] border border-[#1E293B] text-white focus:outline-none focus:border-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20"
          >
            Activate Hardware Device
          </button>
        </form>
      </div>
    </div>
  );
};
