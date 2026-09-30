import React from 'react';
import { Activity, ShieldCheck, Wallet, UserCheck, Stethoscope, Building2 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentRole, handleRoleChange, walletState, onConnectWallet }) {
  const roles = [
    { id: 'User', label: 'User', icon: UserCheck },
    { id: 'Doctor', label: 'Doctor', icon: Stethoscope },
    { id: 'Hospital', label: 'Hospital', icon: Building2 },
    { id: 'Admin', label: 'Admin', icon: ShieldCheck },
  ];

  const navLinks = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'donors', label: 'Donors' },
    { id: 'recipients', label: 'Waitlist' },
    { id: 'matching', label: 'Matching' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'hospitals', label: 'Hospital' },
    { id: 'audit', label: 'Audit' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0e16]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="flex shrink-0 items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400 text-slate-950">
            <Activity className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold tracking-tight text-white">OrganChain</p>
            <p className="hidden text-[11px] text-slate-500 sm:block">Donor & recipient matcher</p>
          </div>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => setActiveTab(link.id)}
                className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-xl border border-white/10 bg-white/5 p-1 lg:flex">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleChange(r.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition ${
                    isSelected ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {r.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onConnectWallet}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              walletState.connected
                ? 'border border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
                : 'bg-teal-400 text-slate-950 hover:bg-teal-300'
            }`}
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">
              {walletState.connected
                ? `${walletState.address.substring(0, 6)}…${walletState.address.substring(walletState.address.length - 4)}`
                : 'Connect'}
            </span>
          </button>
        </div>
      </div>

      <div className="border-t border-white/5 md:hidden">
        <div className="flex gap-1 overflow-x-auto px-4 py-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => setActiveTab(link.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${
                activeTab === link.id ? 'bg-white/10 text-white' : 'text-slate-400'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 lg:hidden">
        <div className="flex gap-1 overflow-x-auto px-4 py-2">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleChange(r.id)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  currentRole === r.id ? 'bg-white/10 text-white' : 'text-slate-400'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {r.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
