import React, { useState, useEffect } from 'react';
import { ShieldCheck, HardDrive, Search, Filter, ExternalLink, RefreshCw, CheckCircle2, Lock, Cpu, Server, Activity, AlertCircle } from 'lucide-react';
import { getAuditTrail } from '../services/api';

export default function AdminAuditPortal({ currentRole, onOpenIpfs }) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const isAdminSession = currentRole === 'Admin';

  useEffect(() => {
    loadAudit();
  }, []);

  const loadAudit = async () => {
    setLoading(true);
    try {
      const res = await getAuditTrail();
      setAuditLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      (log.referenceId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.txHash || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.ipfsHash || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'ALL' || log.eventType === filterType;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>System Admin & Audit Subsystem</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Blockchain Ledger Audit & Node Monitor</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time immutable audit trail of organ pledges, matching scoring events, doctor sign-offs, and hospital clearances.
          </p>
        </div>
        <button
          onClick={loadAudit}
          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 flex items-center space-x-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Role Session Banner */}
      {!isAdminSession ? (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center space-x-3 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-amber-200">
            <strong className="font-bold text-white">Public Auditor View: </strong>
            You are viewing the Blockchain Audit Explorer in read-only mode from the <span className="underline font-semibold">{currentRole}</span> perspective. Switch active perspective to <strong className="text-amber-400 font-semibold">System Admin</strong> in the top header bar to access master node controls.
          </div>
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Master System Administrator Active (Contract Owner Node)</span>
          </div>
          <span className="bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-mono text-[11px]">Super Admin Access</span>
        </div>
      )}

      {/* System Node Health Stats (Admin Perspective) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
          <Server className="w-8 h-8 text-cyan-400" />
          <div>
            <span className="text-xs text-slate-400 block">Smart Contract Address</span>
            <span className="font-mono text-xs font-bold text-white">0x5FbDB2315678...</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
          <Activity className="w-8 h-8 text-emerald-400" />
          <div>
            <span className="text-xs text-slate-400 block">EVM Consensus Target</span>
            <span className="font-mono text-xs font-bold text-white">Hardhat Paris (Solc 0.8.20)</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
          <HardDrive className="w-8 h-8 text-purple-400" />
          <div>
            <span className="text-xs text-slate-400 block">IPFS Gateway Health</span>
            <span className="font-mono text-xs font-bold text-emerald-400">100% Operational</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, Tx Hash, CID, or Event Details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="CONSENT_REGISTERED">CONSENT_REGISTERED</option>
            <option value="RECIPIENT_REGISTERED">RECIPIENT_REGISTERED</option>
            <option value="ORGAN_LISTED">ORGAN_LISTED</option>
            <option value="MATCH_GENERATED">MATCH_GENERATED</option>
            <option value="DOCTOR_APPROVED">DOCTOR_APPROVED</option>
            <option value="HOSPITAL_CLEARED">HOSPITAL_CLEARED</option>
            <option value="TRANSPLANT_COMPLETED">TRANSPLANT_COMPLETED</option>
          </select>
        </div>
      </div>

      {/* Audit Stream Table */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Immutable On-Chain Ledger Blocks ({filteredLogs.length})</span>
          </h3>
        </div>

        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 text-slate-400 text-xs">
              No matching blockchain audit entries found.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.entryId || log.timestamp} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">Block #{log.blockNumber || log.entryId}</span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold ${
                      log.eventType === 'TRANSPLANT_COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                      log.eventType === 'HOSPITAL_CLEARED' ? 'bg-cyan-500/20 text-cyan-400' :
                      log.eventType === 'DOCTOR_APPROVED' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {log.eventType}
                    </span>
                  </div>

                  <span className="text-slate-500 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Reference ID</span>
                    <span className="font-mono font-bold text-white block">{log.referenceId}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Triggered By Address</span>
                    <span className="font-mono text-slate-300 block truncate">{log.triggeredBy}</span>
                  </div>
                </div>

                <p className="text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-900">
                  {log.details}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
                  <div className="flex items-center space-x-2 text-slate-500 font-mono">
                    <span>Tx Hash:</span>
                    <span className="text-slate-400">{log.txHash?.substring(0, 18)}...</span>
                  </div>

                  {log.ipfsHash && (
                    <button
                      onClick={() => onOpenIpfs(log.ipfsHash)}
                      className="text-purple-400 hover:text-purple-300 font-mono font-semibold flex items-center space-x-1"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>IPFS CID: {log.ipfsHash.substring(0, 14)}...</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
