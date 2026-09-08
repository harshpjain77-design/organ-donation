import React, { useState, useEffect } from 'react';
import { UserCheck, Users, HeartHandshake, ShieldCheck, Cpu, ArrowRight, Activity, CheckCircle2, Clock, HardDrive, Award, Sparkles, Server, ChevronRight } from 'lucide-react';
import { getDonors, getRecipients, getOrgans, getMatches, getAuditTrail } from '../services/api';

export default function Dashboard({ currentRole, setActiveTab, onOpenIpfs, onOpenBreakdown }) {
  const [stats, setStats] = useState({
    donorsCount: 0,
    recipientsCount: 0,
    organsCount: 0,
    matchesCount: 0,
    auditCount: 0
  });

  const [recentMatches, setRecentMatches] = useState([]);
  const [recentAudit, setRecentAudit] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [donorsRes, recipRes, organsRes, matchesRes, auditRes] = await Promise.all([
        getDonors(),
        getRecipients(),
        getOrgans(),
        getMatches(),
        getAuditTrail()
      ]);

      setStats({
        donorsCount: donorsRes.count || donorsRes.data?.length || 0,
        recipientsCount: recipRes.count || recipRes.data?.length || 0,
        organsCount: organsRes.count || organsRes.data?.length || 0,
        matchesCount: matchesRes.count || matchesRes.data?.length || 0,
        auditCount: auditRes.count || auditRes.data?.length || 0
      });

      setRecentMatches(matchesRes.data || []);
      setRecentAudit(auditRes.data ? auditRes.data.slice(0, 5) : []);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Sleek Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d1322] via-[#090d16] to-[#070a12] p-8 sm:p-10 border border-slate-800/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-slate-900/90 border border-cyan-500/30 px-3.5 py-1 rounded-full text-cyan-300 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Decentralized Architecture • Ethereum Smart Contracts & IPFS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Decentralized Organ <span className="gradient-text">Donor & Recipient Matcher</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
            Multi-hospital interoperability platform using 7-parameter weighted scoring, tamper-proof blockchain audit trails, and encrypted off-chain IPFS document storage.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setActiveTab('matching')}
              className="bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-extrabold px-6 py-3 rounded-2xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
            >
              <Cpu className="w-4 h-4 text-slate-950" />
              <span>Launch Matching Engine</span>
              <ChevronRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={() => setActiveTab('donors')}
              className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold px-5 py-3 rounded-2xl text-xs transition-all border border-slate-700/80 flex items-center space-x-2"
            >
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Pledge Consent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bento Grid Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bento-card p-6 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Active Donors</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono">{stats.donorsCount}</div>
            <span className="text-[11px] text-cyan-400 font-semibold">Consent Verified</span>
          </div>
        </div>

        <div className="bento-card p-6 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Waitlist Queue</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono">{stats.recipientsCount}</div>
            <span className="text-[11px] text-purple-400 font-semibold">Registered Patients</span>
          </div>
        </div>

        <div className="bento-card p-6 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Organs Listed</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono">{stats.organsCount}</div>
            <span className="text-[11px] text-emerald-400 font-semibold">Harvested Ready</span>
          </div>
        </div>

        <div className="bento-card p-6 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Matches</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono">{stats.matchesCount}</div>
            <span className="text-[11px] text-rose-400 font-semibold">AI Weighted Index</span>
          </div>
        </div>

        <div className="bento-card p-6 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Ledger Blocks</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono">{stats.auditCount}</div>
            <span className="text-[11px] text-amber-400 font-semibold">On-Chain Verified</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Matches Pipeline & Real-Time Blockchain Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Matches */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bento-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span>Transplant Clearance Pipeline</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Multi-hospital verification status</p>
              </div>
              <button
                onClick={() => setActiveTab('matching')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
              >
                <span>Matching Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentMatches.length === 0 ? (
              <div className="p-8 text-center bg-[#060911]/80 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
                <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-medium">No active matches generated.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMatches.map(m => (
                  <div key={m.matchId || m.id} className="bg-[#070b14]/90 p-4 rounded-xl border border-slate-800/90 flex flex-wrap items-center justify-between gap-4 hover:border-slate-700 transition-all">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">{m.matchId}</span>
                        <span className="text-sm font-bold text-white">
                          {m.organType} ({m.recipientName})
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center space-x-3">
                        <span>Donor: {m.donorName || m.donorId}</span>
                        <span>•</span>
                        <span>Score: <strong className="text-emerald-400 font-mono">{m.totalScore}%</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onOpenBreakdown(m)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center space-x-1"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Breakdown</span>
                      </button>

                      {m.status === 'Completed' ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Transplant Cleared</span>
                        </span>
                      ) : m.status === 'DoctorApproved' ? (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Hospital</span>
                        </span>
                      ) : (
                        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Doctor</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Blockchain Audit Stream */}
        <div className="space-y-6">
          <div className="bento-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>On-Chain Audit Stream</span>
              </h3>
              <button
                onClick={() => setActiveTab('audit')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Explorer
              </button>
            </div>

            <div className="space-y-3">
              {recentAudit.map(item => (
                <div key={item.entryId || item.timestamp} className="bg-[#060911]/90 p-3.5 rounded-xl border border-slate-800/90 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-cyan-400 font-bold text-[11px]">#{item.entryId} {item.eventType}</span>
                    <span className="text-slate-500 text-[10px]">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] truncate">{item.details}</p>
                  {item.ipfsHash && (
                    <button
                      onClick={() => onOpenIpfs(item.ipfsHash)}
                      className="mt-1 text-purple-400 hover:text-purple-300 font-mono text-[10px] flex items-center space-x-1"
                    >
                      <HardDrive className="w-3 h-3" />
                      <span>{item.ipfsHash.substring(0, 14)}...</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
