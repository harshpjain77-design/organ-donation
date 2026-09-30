import React, { useState, useEffect } from 'react';
import { ShieldCheck, HeartHandshake, CheckCircle2, AlertCircle, Clock, Plus } from 'lucide-react';
import { getOrgans, listOrgan, getMatches, approveByHospital } from '../services/api';
import { PageHeader, Card, CardHeader, Button, Badge, Field, AlertBanner } from '../components/ui';

export default function HospitalPortal({ currentRole, walletState }) {
  const [organs, setOrgans] = useState([]);
  const [matches, setMatches] = useState([]);
  const [submittingOrgan, setSubmittingOrgan] = useState(false);
  const [clearingMatchId, setClearingMatchId] = useState(null);
  const [hospitalNotesMap, setHospitalNotesMap] = useState({});
  const isHospitalSession = currentRole === 'Hospital' || currentRole === 'Admin';
  const [organForm, setOrganForm] = useState({
    donorId: 'DNR-1001',
    organType: 'Kidney',
    bloodGroup: 'O+',
    hospitalName: 'St. Jude General Hospital',
    donorAge: '28',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [organsRes, matchesRes] = await Promise.all([getOrgans(), getMatches()]);
      setOrgans(organsRes.data || []);
      setMatches(matchesRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleListOrgan = async (e) => {
    e.preventDefault();
    setSubmittingOrgan(true);
    try {
      const res = await listOrgan(organForm);
      if (res.success) {
        loadData();
        alert('Harvested organ listed successfully!');
      }
    } catch (err) {
      alert('Error listing organ: ' + err.message);
    } finally {
      setSubmittingOrgan(false);
    }
  };

  const handleHospitalClearance = async (matchId) => {
    const notes = hospitalNotesMap[matchId] || 'Hospital transplant clearance granted. Operating suite and logistics scheduled.';
    setClearingMatchId(matchId);
    try {
      const res = await approveByHospital(
        matchId,
        notes,
        walletState?.address || '0xcd3B766CCDd6AE721141F452C550Ca635964ce34'
      );
      if (res.success) {
        loadData();
        alert('Transplant procedure cleared and recorded directly to the Blockchain Ledger!');
      } else {
        alert('Hospital clearance error: ' + res.error);
      }
    } catch (err) {
      alert('Error clearing transplant: ' + err.message);
    } finally {
      setClearingMatchId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        accent="emerald"
        eyebrow="Hospital"
        title="Listing & clearance"
        description="List harvested organs and complete dual-approval transplant clearance."
      />

      {!isHospitalSession ? (
        <AlertBanner tone="emerald" icon={AlertCircle}>
          Preview only. Switch perspective to <strong>Hospital</strong> to manage clearances.
        </AlertBanner>
      ) : (
        <AlertBanner tone="emerald" icon={CheckCircle2} trailing={<Badge tone="emerald">Transplant center</Badge>}>
          Authorized facility · <span className="font-mono">{walletState.address.substring(0, 8)}…</span>
        </AlertBanner>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="space-y-5 p-6">
          <CardHeader icon={HeartHandshake} title="List harvested organ" tone="teal" />
          <form onSubmit={handleListOrgan} className="space-y-4">
            <Field label="Donor ID">
              <input
                type="text"
                required
                value={organForm.donorId}
                onChange={(e) => setOrganForm({ ...organForm, donorId: e.target.value })}
                className="ui-input font-mono text-teal-300"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Organ">
                <select
                  value={organForm.organType}
                  onChange={(e) => setOrganForm({ ...organForm, organType: e.target.value })}
                  className="ui-input"
                >
                  {['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Cornea'].map((org) => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </Field>
              <Field label="Blood">
                <select
                  value={organForm.bloodGroup}
                  onChange={(e) => setOrganForm({ ...organForm, bloodGroup: e.target.value })}
                  className="ui-input"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Hospital">
              <input
                type="text"
                value={organForm.hospitalName}
                onChange={(e) => setOrganForm({ ...organForm, hospitalName: e.target.value })}
                className="ui-input"
              />
            </Field>
            <Button type="submit" variant="emerald" disabled={submittingOrgan} className="w-full">
              <Plus className="h-4 w-4" />
              {submittingOrgan ? 'Publishing…' : 'List for matching'}
            </Button>
          </form>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <CardHeader icon={ShieldCheck} title="Dual-approval pipeline" subtitle={`${organs.length} organs listed`} tone="emerald" />
          <div className="space-y-3">
            {matches.map((m) => (
              <div key={m.matchId || m.id} className="space-y-3 rounded-2xl border border-white/10 bg-[#0b101a]/80 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      <span className="mr-2 font-mono text-xs text-teal-300">{m.matchId}</span>
                      {m.organType}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {m.recipientName} · {m.totalScore}%
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={m.doctorApproved ? 'emerald' : 'purple'}>
                      Doctor {m.doctorApproved ? 'signed' : 'pending'}
                    </Badge>
                    <Badge tone={m.hospitalCleared ? 'emerald' : 'cyan'}>
                      Hospital {m.hospitalCleared ? 'cleared' : 'pending'}
                    </Badge>
                  </div>
                </div>

                {m.hospitalCleared ? (
                  <AlertBanner tone="emerald" icon={ShieldCheck}>
                    Cleared. {m.hospitalNotes}
                  </AlertBanner>
                ) : m.doctorApproved ? (
                  <div className="space-y-3">
                    <textarea
                      rows="2"
                      placeholder="Clearance notes…"
                      value={hospitalNotesMap[m.matchId] || ''}
                      onChange={(e) => setHospitalNotesMap({ ...hospitalNotesMap, [m.matchId]: e.target.value })}
                      className="ui-input"
                    />
                    <Button
                      variant="emerald"
                      className="w-full"
                      onClick={() => handleHospitalClearance(m.matchId)}
                      disabled={clearingMatchId === m.matchId}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {clearingMatchId === m.matchId ? 'Broadcasting…' : 'Execute clearance'}
                    </Button>
                  </div>
                ) : (
                  <AlertBanner tone="purple" icon={Clock}>
                    Unlocks after doctor medical approval.
                  </AlertBanner>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
