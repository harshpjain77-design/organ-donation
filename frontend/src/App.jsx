import React, { useState } from 'react';
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
import { UserCheck, Stethoscope, Building2, ShieldCheck } from 'lucide-react';

const ROLE_PRESETS = {
  User: {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    defaultTab: 'donors',
    title: 'Donor & recipient',
    desc: 'Pledge consent, apply as a recipient, and review IPFS medical hashes.',
  },
  Doctor: {
    address: '0x8626f69A7373073758299836439446777AD2D2b1',
    defaultTab: 'doctors',
    title: 'Doctor workbench',
    desc: 'Review reports, inspect compatibility scores, and sign medical approvals.',
  },
  Hospital: {
    address: '0xcd3B766CCDd6AE721141F452C550Ca635964ce34',
    defaultTab: 'hospitals',
    title: 'Hospital clearance',
    desc: 'List harvested organs and complete dual-approval transplant clearance.',
  },
  Admin: {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    defaultTab: 'audit',
    title: 'System admin',
    desc: 'Inspect the ledger, contract activity, and node health.',
  },
};

const ROLE_ICON = {
  User: UserCheck,
  Doctor: Stethoscope,
  Hospital: Building2,
  Admin: ShieldCheck,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('User');
  const [walletState, setWalletState] = useState({
    connected: false,
    address: ROLE_PRESETS.User.address,
    chainId: '31337',
  });

  const [modalBreakdownMatch, setModalBreakdownMatch] = useState(null);
  const [modalIpfsCid, setModalIpfsCid] = useState(null);

  const handleRoleChange = (roleId) => {
    setCurrentRole(roleId);
    const preset = ROLE_PRESETS[roleId];
    if (preset) {
      setActiveTab(preset.defaultTab);
      if (!walletState.connected) {
        setWalletState((prev) => ({ ...prev, address: preset.address }));
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
  const RoleIcon = ROLE_ICON[currentRole] || UserCheck;

  return (
    <div className="flex min-h-screen flex-col text-slate-100">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        handleRoleChange={handleRoleChange}
        walletState={walletState}
        onConnectWallet={handleConnectWallet}
      />

      <div className="border-b border-white/5 bg-[#0c121c]/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 text-sm">
            <RoleIcon className="h-4 w-4 text-teal-300" />
            <span className="font-medium text-slate-200">{activePreset.title}</span>
            <span className="hidden text-slate-500 sm:inline">·</span>
            <span className="hidden text-slate-400 sm:inline">{activePreset.desc}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Hardhat 31337
            </span>
            <span className="font-mono text-slate-400">
              {walletState.address.substring(0, 6)}…{walletState.address.substring(walletState.address.length - 4)}
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            currentRole={currentRole}
            setActiveTab={setActiveTab}
            onOpenIpfs={(cid) => setModalIpfsCid(cid)}
            onOpenBreakdown={(match) => setModalBreakdownMatch(match)}
          />
        )}
        {activeTab === 'donors' && (
          <DonorPortal
            currentRole={currentRole}
            walletState={walletState}
            onOpenIpfs={(cid) => setModalIpfsCid(cid)}
          />
        )}
        {activeTab === 'recipients' && (
          <RecipientPortal
            currentRole={currentRole}
            walletState={walletState}
            onOpenIpfs={(cid) => setModalIpfsCid(cid)}
          />
        )}
        {activeTab === 'matching' && (
          <MatchingEnginePortal
            currentRole={currentRole}
            walletState={walletState}
            onOpenIpfs={(cid) => setModalIpfsCid(cid)}
            onOpenBreakdown={(match) => setModalBreakdownMatch(match)}
          />
        )}
        {activeTab === 'doctors' && (
          <DoctorPortal
            currentRole={currentRole}
            walletState={walletState}
            onOpenIpfs={(cid) => setModalIpfsCid(cid)}
            onOpenBreakdown={(match) => setModalBreakdownMatch(match)}
          />
        )}
        {activeTab === 'hospitals' && (
          <HospitalPortal
            currentRole={currentRole}
            walletState={walletState}
            onOpenBreakdown={(match) => setModalBreakdownMatch(match)}
          />
        )}
        {activeTab === 'audit' && (
          <AdminAuditPortal
            currentRole={currentRole}
            onOpenIpfs={(cid) => setModalIpfsCid(cid)}
          />
        )}
      </main>

      <ScoreBreakdownModal match={modalBreakdownMatch} onClose={() => setModalBreakdownMatch(null)} />
      <IpfsViewerModal cid={modalIpfsCid} onClose={() => setModalIpfsCid(null)} />

      <footer className="border-t border-white/5 py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <p>© 2026 OrganChain. On-chain matching with IPFS medical records.</p>
          <p className="font-mono text-[11px] text-slate-600">Solidity 0.8.20 · Express · React</p>
        </div>
      </footer>
    </div>
  );
}
