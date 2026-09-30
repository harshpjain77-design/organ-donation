import React, { useState, useEffect } from 'react';
import { Stethoscope, CheckCircle2, HardDrive, Award, FileText, AlertCircle } from 'lucide-react';
import { getMatches, approveByDoctor } from '../services/api';
import { PageHeader, Card, Button, Badge, AlertBanner, EmptyState } from '../components/ui';

export default function DoctorPortal({ currentRole, walletState, onOpenIpfs, onOpenBreakdown }) {
  const [matches, setMatches] = useState([]);
  const [approvingId, setApprovingId] = useState(null);
  const [doctorNotesMap, setDoctorNotesMap] = useState({});
  const isDoctorSession = currentRole === 'Doctor' || currentRole === 'Admin';

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const res = await getMatches();
      setMatches(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDoctorApprove = async (matchId) => {
    const notes = doctorNotesMap[matchId] || 'Medically compatible. Cross-match and laboratory reports verified.';
    setApprovingId(matchId);
    try {
      const res = await approveByDoctor(
        matchId,
        notes,
        walletState?.address || '0x8626f69A7373073758299836439446777AD2D2b1'
      );
      if (res.success) {
        loadMatches();
        alert(`Match ${matchId} successfully verified by Doctor on Blockchain Ledger!`);
      } else {
        alert('Doctor sign-off error: ' + res.error);
      }
    } catch (err) {
      alert('Error approving match: ' + err.message);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        accent="purple"
        eyebrow="Clinical"
        title="Doctor workbench"
        description="Inspect IPFS reports and sign medical approval before hospital clearance."
      />

      {!isDoctorSession ? (
        <AlertBanner tone="purple" icon={AlertCircle}>
          Preview only. Switch perspective to <strong>Doctor</strong> to sign approvals.
        </AlertBanner>
      ) : (
        <AlertBanner
          tone="emerald"
          icon={CheckCircle2}
          trailing={<Badge tone="emerald">Physician</Badge>}
        >
          Authorized session · <span className="font-mono">{walletState.address.substring(0, 8)}…</span>
        </AlertBanner>
      )}

      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <FileText className="h-4 w-4 text-violet-300" />
          Matches for verification
        </h3>
        <Badge>
          {matches.filter((m) => m.status === 'Pending').length} pending
        </Badge>
      </div>

      {matches.length === 0 ? (
        <EmptyState icon={Stethoscope} title="Nothing queued" description="No matches are waiting for doctor verification." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {matches.map((m) => (
            <Card key={m.matchId || m.id} className="space-y-4 p-5">
              <div className="flex items-start justify-between border-b border-white/5 pb-3">
                <div>
                  <p className="font-mono text-xs text-teal-300">{m.matchId}</p>
                  <h4 className="mt-0.5 font-semibold text-white">{m.organType} match</h4>
                </div>
                <p className="font-mono text-xl font-semibold text-emerald-300">{m.totalScore}%</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-[#0b101a] p-3">
                  <p className="text-[11px] text-slate-500">Donor</p>
                  <p className="mt-0.5 font-medium text-white">{m.donorName || m.donorId}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b101a] p-3">
                  <p className="text-[11px] text-slate-500">Recipient</p>
                  <p className="mt-0.5 font-medium text-white">{m.recipientName || m.recipientId}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={() => onOpenBreakdown(m)} className="inline-flex items-center gap-1 text-teal-300">
                  <Award className="h-3.5 w-3.5" /> Score details
                </button>
                <button
                  type="button"
                  onClick={() => onOpenIpfs('QmPZ9gcawA221BaGwtw272hsLtGfLwGfL29G9G112hHs12')}
                  className="inline-flex items-center gap-1 text-violet-300"
                >
                  <HardDrive className="h-3.5 w-3.5" /> IPFS report
                </button>
              </div>

              {m.doctorApproved ? (
                <AlertBanner tone="emerald" icon={CheckCircle2}>
                  Signed. <span className="font-mono text-[11px]">{m.doctorNotes}</span>
                </AlertBanner>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows="2"
                    placeholder="Verification notes…"
                    value={doctorNotesMap[m.matchId] || ''}
                    onChange={(e) => setDoctorNotesMap({ ...doctorNotesMap, [m.matchId]: e.target.value })}
                    className="ui-input"
                  />
                  <Button
                    variant="purple"
                    className="w-full"
                    onClick={() => handleDoctorApprove(m.matchId)}
                    disabled={approvingId === m.matchId}
                  >
                    <Stethoscope className="h-4 w-4" />
                    {approvingId === m.matchId ? 'Signing…' : 'Sign medical approval'}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
