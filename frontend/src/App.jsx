import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DonorPortal from './pages/DonorPortal';
import RecipientPortal from './pages/RecipientPortal';
import MatchingEnginePortal from './pages/MatchingEnginePortal';
import DoctorPortal from './pages/DoctorPortal';
import HospitalPortal from './pages/HospitalPortal';
import AdminAuditPortal from './pages/AdminAuditPortal';
import ScoreBreakdownModal from './components/ScoreBreakdownModal';
import IpfsViewerModal from './components/IpfsViewerModal';
import { connectWallet } from './services/web3';
import { loginUser } from './services/api';
import { UserCheck, Stethoscope, Building2, ShieldCheck, ArrowRight, Wallet, CheckCircle2 } from 'lucide-react';

const ROLE_PRESETS = {
  User: {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    defaultTab: 'donors',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    title: 'User Perspective (Donor & Recipient)',
    desc: 'Register organ pledge consents, submit recipient waitlist applications, and view off-chain IPFS medical document hashes.'
  },
  Doctor: {
    address: '0x8626f69A7373073758299836439446777AD2D2b1',
    defaultTab: 'doctors',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    title: 'Doctor Workbench Perspective',
    desc: 'Review candidate medical reports from IPFS, examine 7-parameter compatibility scores, and sign off doctor medical approvals on-chain.'
  },
  Hospital: {
    address: '0xcd3B766CCDd6AE721141F452C550Ca635964ce34',
    defaultTab: 'hospitals',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    title: 'Hospital Clearance Perspective',
    desc: 'List harvested organs, verify doctor approvals, execute final hospital clearances, and broadcast transplant execution blocks.'
  },
  Admin: {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    defaultTab: 'audit',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    title: 'System Administrator & Audit Perspective',
    desc: 'Inspect full blockchain ledger blocks, smart contract parameters, authorized stakeholder registries, and system metrics.'
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('User');
  const [walletState, setWalletState] = useState({
    connected: false,
    address: ROLE_PRESETS.User.address,
    chainId: '31337'
  });

  const [modalBreakdownMatch, setModalBreakdownMatch] = useState(null);
  const [modalIpfsCid, setModalIpfsCid] = useState(null);

  // Switch role and update view & wallet context
  const handleRoleChange = (roleId) => {
    setCurrentRole(roleId);
    const preset = ROLE_PRESETS[roleId];
    if (preset) {
      setActiveTab(preset.defaultTab);
      if (!walletState.connected) {
        setWalletState(prev => ({ ...prev, address: preset.address }));
      }
      loginUser(preset.address, roleId).catch(console.error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const res = await connectWallet();
      setWalletState(res);
      await loginUser(res.address, currentRole);
    } catch (err) {
      alert(err.message);
    }
  };

  const activePreset = ROLE_PRESETS[currentRole] || ROLE_PRESETS.User;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        handleRoleChange={handleRoleChange}
        walletState={walletState}
        onConnectWallet={handleConnectWallet}
      />

      {/* Stakeholder Perspective Context Banner */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center space-x-1.5 ${activePreset.badgeColor}`}>
              {currentRole === 'User' && <UserCheck className="w-3.5 h-3.5" />}
              {currentRole === 'Doctor' && <Stethoscope className="w-3.5 h-3.5" />}
              {currentRole === 'Hospital' && <Building2 className="w-3.5 h-3.5" />}
              {currentRole === 'Admin' && <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{currentRole} Session</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>{activePreset.title}</span>
              </h3>
              <p className="text-xs text-slate-400">{activePreset.desc}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono hidden md:inline">
              Session Address: <strong className="text-slate-200">{walletState.address.substring(0, 6)}...{walletState.address.substring(walletState.address.length - 4)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            currentRole={currentRole}
            setActiveTab={setActiveTab}
            onOpenIpfs={cid => setModalIpfsCid(cid)}
            onOpenBreakdown={match => setModalBreakdownMatch(match)}
          />
        )}

        {activeTab === 'donors' && (
          <DonorPortal
            currentRole={currentRole}
            setActiveTab={setActiveTab}
            walletState={walletState}
            onOpenIpfs={cid => setModalIpfsCid(cid)}
          />
        )}

        {activeTab === 'recipients' && (
          <RecipientPortal
            currentRole={currentRole}
            setActiveTab={setActiveTab}
            walletState={walletState}
            onOpenIpfs={cid => setModalIpfsCid(cid)}
          />
        )}

        {activeTab === 'matching' && (
          <MatchingEnginePortal
            currentRole={currentRole}
            walletState={walletState}
            onOpenIpfs={cid => setModalIpfsCid(cid)}
            onOpenBreakdown={match => setModalBreakdownMatch(match)}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorPortal
            currentRole={currentRole}
            walletState={walletState}
            onOpenIpfs={cid => setModalIpfsCid(cid)}
            onOpenBreakdown={match => setModalBreakdownMatch(match)}
          />
        )}

        {activeTab === 'hospitals' && (
          <HospitalPortal
            currentRole={currentRole}
            walletState={walletState}
            onOpenBreakdown={match => setModalBreakdownMatch(match)}
          />
        )}

        {activeTab === 'audit' && (
          <AdminAuditPortal
            currentRole={currentRole}
            onOpenIpfs={cid => setModalIpfsCid(cid)}
          />
        )}
      </main>

      {/* Global Modals */}
      <ScoreBreakdownModal
        match={modalBreakdownMatch}
        onClose={() => setModalBreakdownMatch(null)}
      />

      <IpfsViewerModal
        cid={modalIpfsCid}
        onClose={() => setModalIpfsCid(null)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center">
          <p>© 2026 OrganChain. Decentralized Organ Donor & Recipient Matcher with Blockchain & IPFS Architecture.</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0 font-mono text-[11px]">
            <span>Solidity v0.8.20</span>
            <span>•</span>
            <span>Node Express API</span>
            <span>•</span>
            <span>React + Tailwind</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
