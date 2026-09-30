import React, { useState, useEffect } from 'react';
import { UserCheck, Users, HeartHandshake, ShieldCheck, Cpu, ArrowRight, Activity, CheckCircle2, Clock, HardDrive } from 'lucide-react';
import { getDonors, getRecipients, getOrgans, getMatches, getAuditTrail } from '../services/api';
import { Card, CardHeader, Button, Badge, StatCard, EmptyState } from '../components/ui';
import ThreeDOrganCanvas from '../components/ThreeDOrganCanvas';

function matchStatus(m) {
  if (m.status === 'Completed') {
    return (
      <Badge tone="emerald">
        <CheckCircle2 className="h-3.5 w-3.5" /> Cleared
      </Badge>
    );
  }
  if (m.status === 'DoctorApproved') {
    return (
      <Badge tone="amber">
        <Clock className="h-3.5 w-3.5" /> Hospital pending
      </Badge>
    );
  }
  return (
    <Badge tone="purple">
      <Clock className="h-3.5 w-3.5" /> Doctor pending
    </Badge>
  );
}

export default function Dashboard({ setActiveTab, onOpenIpfs, onOpenBreakdown }) {
  const [stats, setStats] = useState({
    donorsCount: 0,
    recipientsCount: 0,
    organsCount: 0,
    matchesCount: 0,
    auditCount: 0,
  });
  const [recentMatches, setRecentMatches] = useState([]);
  const [recentAudit, setRecentAudit] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [donorsRes, recipRes, organsRes, matchesRes, auditRes] = await Promise.all([
        getDonors(),
        getRecipients(),
        getOrgans(),
        getMatches(),
        getAuditTrail(),
      ]);

      setStats({
        donorsCount: donorsRes.count || donorsRes.data?.length || 0,
        recipientsCount: recipRes.count || recipRes.data?.length || 0,
        organsCount: organsRes.count || organsRes.data?.length || 0,
        matchesCount: matchesRes.count || matchesRes.data?.length || 0,
        auditCount: auditRes.count || auditRes.data?.length || 0,
      });
      setRecentMatches(matchesRes.data || []);
      setRecentAudit(auditRes.data ? auditRes.data.slice(0, 5) : []);
    } catch (err) {
      console.error('Dashboard data load error:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <ThreeDOrganCanvas
        badgeText="Decentralized 3D AI Match Matrix"
        title="Automated organ matching & blockchain audit clearance"
        subtitle="Consent records, recipient waitlists, multi-factor compatibility scoring, doctor verification, and hospital clearance tracked on immutable ledger."
        height="280px"
      />

      <Card className="overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-slate-900/90 to-teal-950/40 border-teal-500/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <Badge tone="teal">7-Parameter Matching · Real IPFS Records</Badge>
            <h3 className="text-xl font-semibold text-white">
              End-to-end multi-stakeholder transplant workflow
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Donors pledge consent → Recipients register medical profiles → AI ranks matches → Doctors verify clinical history → Hospitals issue clearance on-chain.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setActiveTab('matching')}>
              <Cpu className="h-4 w-4" />
              Open matching
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="secondary" onClick={() => setActiveTab('donors')}>
              <UserCheck className="h-4 w-4" />
              Pledge consent
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Donors" value={stats.donorsCount} hint="Active pledges" icon={UserCheck} tone="teal" />
        <StatCard label="Waitlist" value={stats.recipientsCount} hint="Registered candidates" icon={Users} tone="purple" />
        <StatCard label="Organs" value={stats.organsCount} hint="Listed for match" icon={HeartHandshake} tone="emerald" />
        <StatCard label="Matches" value={stats.matchesCount} hint="7-factor scores" icon={Activity} tone="rose" />
        <StatCard label="Audit events" value={stats.auditCount} hint="Ledger entries" icon={ShieldCheck} tone="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <CardHeader
            icon={Activity}
            title="Clearance pipeline"
            subtitle="Doctor and hospital dual sign-off"
            tone="teal"
            action={
              <button
                type="button"
                onClick={() => setActiveTab('matching')}
                className="text-xs font-medium text-teal-300 hover:text-teal-200"
              >
                Matching →
              </button>
            }
          />
          {recentMatches.length === 0 ? (
            <EmptyState icon={Cpu} title="No matches yet" description="Run the matching engine after organs are listed." />
          ) : (
            <div className="space-y-2">
              {recentMatches.map((m) => (
                <div
                  key={m.matchId || m.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#0b101a]/70 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {m.organType} · {m.recipientName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      <span className="font-mono text-teal-300/80">{m.matchId}</span>
                      <span className="mx-2">·</span>
                      Donor {m.donorName || m.donorId}
                      <span className="mx-2">·</span>
                      Score {m.totalScore}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => onOpenBreakdown(m)}>
                      Breakdown
                    </Button>
                    {matchStatus(m)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <CardHeader
            icon={ShieldCheck}
            title="Ledger stream"
            subtitle="Latest on-chain events"
            tone="emerald"
            action={
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className="text-xs font-medium text-teal-300 hover:text-teal-200"
              >
                Explorer
              </button>
            }
          />
          <div className="space-y-2">
            {recentAudit.map((item) => (
              <div key={item.entryId || item.timestamp} className="rounded-xl border border-white/5 bg-[#0b101a]/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-teal-300">
                    #{item.entryId} {item.eventType}
                  </span>
                  <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="mt-1 truncate text-xs text-slate-400">{item.details}</p>
                {item.ipfsHash && (
                  <button
                    type="button"
                    onClick={() => onOpenIpfs(item.ipfsHash)}
                    className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] text-violet-300"
                  >
                    <HardDrive className="h-3 w-3" />
                    {item.ipfsHash.substring(0, 14)}…
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
