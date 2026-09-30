import React, { useState, useEffect } from 'react';
import { ShieldCheck, HardDrive, Search, Filter, RefreshCw, CheckCircle2, Lock, Server, Activity, AlertCircle } from 'lucide-react';
import { getAuditTrail } from '../services/api';
import { PageHeader, Card, CardHeader, Button, Badge, AlertBanner, EmptyState } from '../components/ui';

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

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      (log.referenceId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.txHash || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.ipfsHash || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || log.eventType === filterType;
    return matchesSearch && matchesFilter;
  });

  const eventTone = (type) => {
    if (type === 'TRANSPLANT_COMPLETED') return 'emerald';
    if (type === 'HOSPITAL_CLEARED') return 'cyan';
    if (type === 'DOCTOR_APPROVED') return 'purple';
    return 'slate';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        accent="amber"
        eyebrow="Audit"
        title="Ledger explorer"
        description="Immutable trail of pledges, matches, doctor sign-offs, and hospital clearances."
        action={
          <Button variant="secondary" onClick={loadAudit}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {!isAdminSession ? (
        <AlertBanner tone="amber" icon={AlertCircle}>
          Read-only explorer. Switch to <strong>Admin</strong> for operator context.
        </AlertBanner>
      ) : (
        <AlertBanner tone="amber" icon={CheckCircle2} trailing={<Badge tone="amber">Owner</Badge>}>
          Administrator session active
        </AlertBanner>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <Server className="h-5 w-5 text-teal-300" />
          <div>
            <p className="text-[11px] text-slate-500">Contract</p>
            <p className="font-mono text-xs text-white">0x5FbDB2315678…</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <Activity className="h-5 w-5 text-emerald-300" />
          <div>
            <p className="text-[11px] text-slate-500">Network</p>
            <p className="font-mono text-xs text-white">Hardhat · Solc 0.8.20</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <HardDrive className="h-5 w-5 text-violet-300" />
          <div>
            <p className="text-[11px] text-slate-500">IPFS</p>
            <p className="font-mono text-xs text-emerald-300">Operational</p>
          </div>
        </Card>
      </div>

      <Card className="flex flex-wrap items-center gap-3 p-4">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search ID, tx hash, CID, or details…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ui-input min-w-[220px] flex-1"
        />
        <Filter className="h-4 w-4 text-slate-500" />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="ui-input w-auto">
          <option value="ALL">All events</option>
          <option value="CONSENT_REGISTERED">CONSENT_REGISTERED</option>
          <option value="RECIPIENT_REGISTERED">RECIPIENT_REGISTERED</option>
          <option value="ORGAN_LISTED">ORGAN_LISTED</option>
          <option value="MATCH_GENERATED">MATCH_GENERATED</option>
          <option value="DOCTOR_APPROVED">DOCTOR_APPROVED</option>
          <option value="HOSPITAL_CLEARED">HOSPITAL_CLEARED</option>
          <option value="TRANSPLANT_COMPLETED">TRANSPLANT_COMPLETED</option>
        </select>
      </Card>

      <Card className="p-6">
        <CardHeader icon={Lock} title={`Ledger blocks (${filteredLogs.length})`} tone="teal" />
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <EmptyState title="No matching entries" description="Try a different search or event filter." />
          ) : (
            filteredLogs.map((log) => (
              <div key={log.entryId || log.timestamp} className="space-y-3 rounded-2xl border border-white/10 bg-[#0b101a]/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-teal-300">#{log.blockNumber || log.entryId}</span>
                    <Badge tone={eventTone(log.eventType)}>{log.eventType}</Badge>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
                  <div>
                    <p className="text-slate-500">Reference</p>
                    <p className="font-mono text-white">{log.referenceId}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Triggered by</p>
                    <p className="truncate font-mono text-slate-300">{log.triggeredBy}</p>
                  </div>
                </div>
                <p className="rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-300">{log.details}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-500">
                  <span>Tx {log.txHash?.substring(0, 18)}…</span>
                  {log.ipfsHash && (
                    <button
                      type="button"
                      onClick={() => onOpenIpfs(log.ipfsHash)}
                      className="inline-flex items-center gap-1 text-violet-300"
                    >
                      <HardDrive className="h-3.5 w-3.5" />
                      {log.ipfsHash.substring(0, 14)}…
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
