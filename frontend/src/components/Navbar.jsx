import React from 'react';
import { Activity, ShieldCheck, Wallet, UserCheck, Stethoscope, Building2, Cpu, FileText, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentRole, handleRoleChange, walletState, onConnectWallet }) {
  const roles = [
    { id: 'User', label: 'User (Donor/Recipient)', icon: UserCheck, color: 'from-cyan-500 to-blue-500' },
    { id: 'Doctor', label: 'Doctor Workbench', icon: Stethoscope, color: 'from-purple-500 to-indigo-500' },
    { id: 'Hospital', label: 'Hospital Portal', icon: Building2, color: 'from-emerald-500 to-teal-500' },
    { id: 'Admin', label: 'System Admin', icon: ShieldCheck, color: 'from-amber-500 to-orange-500' }
  ];

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, roles: ['User', 'Doctor', 'Hospital', 'Admin'] },
    { id: 'donors', label: 'Donor Consent', icon: UserCheck, roles: ['User', 'Admin'] },
    { id: 'recipients', label: 'Recipient Waitlist', icon: FileText, roles: ['User', 'Doctor', 'Admin'] },
    { id: 'matching', label: 'AI Matching Engine', icon: Cpu, roles: ['Doctor', 'Hospital', 'Admin'] },
    { id: 'doctors', label: 'Doctor Approvals', icon: Stethoscope, roles: ['Doctor', 'Admin'] },
    { id: 'hospitals', label: 'Hospital Clearance', icon: Building2, roles: ['Hospital', 'Admin'] },
    { id: 'audit', label: 'Blockchain Audit', icon: ShieldCheck, roles: ['User', 'Doctor', 'Hospital', 'Admin'] }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/80 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      {/* Top Bar - Node Health & Role Switcher */}
      <div className="bg-[#060911]/90 px-4 py-1.5 text-xs border-b border-slate-800/60 flex flex-wrap justify-between items-center text-slate-400 gap-2">
        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Node: Hardhat (31337)</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-800">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-purple-300 font-mono">IPFS Gateway Active</span>
          </div>
        </div>

        {/* Modular Role Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium hidden md:inline text-[11px]">Stakeholder Perspective:</span>
          <div className="flex bg-[#0b0f19] p-1 rounded-xl border border-slate-800 space-x-1">
            {roles.map(r => {
              const Icon = r.icon;
              const isSelected = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleRoleChange(r.id)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 flex items-center space-x-1.5 ${
                    isSelected
                      ? `bg-gradient-to-r ${r.color} text-slate-950 shadow-md shadow-cyan-500/10 font-extrabold`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
            <Activity className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center space-x-2">
              <span className="gradient-text">OrganChain</span>
              <span className="bg-cyan-500/10 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/30 font-mono font-bold tracking-wider">
                DECENTRALIZED
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Decentralized Organ Donor & Recipient Matcher</p>
          </div>
        </div>

        {/* Modular Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-2xl border border-slate-800/80">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            const isRecommended = link.roles.includes(currentRole);

            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
                    : isRecommended
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Wallet Connection */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onConnectWallet}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center space-x-2 ${
              walletState.connected
                ? 'bg-slate-900 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/20'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>
              {walletState.connected
                ? `${walletState.address.substring(0, 6)}...${walletState.address.substring(walletState.address.length - 4)}`
                : 'Connect MetaMask'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Links */}
      <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 py-2 flex overflow-x-auto space-x-2">
        {navLinks.map(link => {
          const Icon = link.icon;
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 ${
                isActive ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
