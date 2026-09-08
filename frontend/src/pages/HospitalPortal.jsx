import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, HeartHandshake, CheckCircle2, AlertCircle, Clock, Plus, Lock } from 'lucide-react';
import { getOrgans, listOrgan, getMatches, approveByHospital } from '../services/api';

export default function HospitalPortal({ currentRole, walletState, onOpenBreakdown }) {
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
    donorAge: '28'
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
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Hospital Interoperability Subsystem</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Organ Harvest Listing & Dual Clearance</h2>
          <p className="text-xs text-slate-400 mt-1">
            Hospitals list harvested donor organs and execute final transplant clearance following doctor verification.
          </p>
        </div>
      </div>

      {/* Role Session Banner */}
      {!isHospitalSession ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center space-x-3 text-xs">
          <AlertCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-emerald-200">
            <strong className="font-bold text-white">Preview Mode: </strong>
            You are currently viewing Hospital Portal from the <span className="underline font-semibold">{currentRole}</span> perspective. Switch active perspective to <strong className="text-emerald-400 font-semibold">Hospital Portal</strong> in the top header bar to manage clearances.
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Authorized Hospital Session Active (Facility Wallet: <span className="font-mono">{walletState.address.substring(0, 8)}...</span>)</span>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono text-[11px]">Transplant Center Admin</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Organ Harvest Listing Form */}
        <div className="lg:col-span-1 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <HeartHandshake className="w-5 h-5 text-cyan-400" />
            <span>List Harvested Donor Organ</span>
          </h3>

          <form onSubmit={handleListOrgan} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Donor ID</label>
              <input
                type="text"
                required
                value={organForm.donorId}
                onChange={e => setOrganForm({ ...organForm, donorId: e.target.value })}
                placeholder="DNR-1001"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Organ Type</label>
                <select
                  value={organForm.organType}
                  onChange={e => setOrganForm({ ...organForm, organType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Cornea'].map(org => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Blood Group</label>
                <select
                  value={organForm.bloodGroup}
                  onChange={e => setOrganForm({ ...organForm, bloodGroup: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Harvesting Hospital</label>
              <input
                type="text"
                value={organForm.hospitalName}
                onChange={e => setOrganForm({ ...organForm, hospitalName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingOrgan}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>{submittingOrgan ? 'Publishing Organ...' : 'List Organ for Matching'}</span>
            </button>
          </form>
        </div>

        {/* Clearance Pipeline Workbench */}
        <div className="lg:col-span-2 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Dual-Approval Clearance Pipeline</span>
          </h3>

          <div className="space-y-4">
            {matches.map(m => (
              <div key={m.matchId || m.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">{m.matchId}</span>
                      <h4 className="text-base font-bold text-white">{m.organType} Transplant</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Recipient: <strong className="text-slate-200">{m.recipientName}</strong> | Score: <strong className="text-emerald-400">{m.totalScore}%</strong>
                    </p>
                  </div>

                  {/* Dual Step Checklist Badges */}
                  <div className="flex items-center space-x-2 text-xs">
                    <span className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center space-x-1 ${
                      m.doctorApproved
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Step 1: Doctor ({m.doctorApproved ? 'Signed' : 'Pending'})</span>
                    </span>

                    <span className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center space-x-1 ${
                      m.hospitalCleared
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Step 2: Hospital ({m.hospitalCleared ? 'Cleared' : 'Pending'})</span>
                    </span>
                  </div>
                </div>

                {/* Final Hospital Execution Box */}
                {m.hospitalCleared ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-xs space-y-1">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Transplant Cleared & Written to Blockchain Ledger!</span>
                    </div>
                    <p className="text-slate-300 text-[11px] font-mono">Hospital Notes: {m.hospitalNotes}</p>
                  </div>
                ) : m.doctorApproved ? (
                  <div className="space-y-3 pt-2">
                    <textarea
                      rows="2"
                      placeholder="Hospital clearance notes, operating room assignment & surgical clearance..."
                      value={hospitalNotesMap[m.matchId] || ''}
                      onChange={e => setHospitalNotesMap({ ...hospitalNotesMap, [m.matchId]: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    ></textarea>

                    <button
                      onClick={() => handleHospitalClearance(m.matchId)}
                      disabled={clearingMatchId === m.matchId}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-slate-950" />
                      <span>{clearingMatchId === m.matchId ? 'Broadcasting Clearance to Ledger...' : 'Execute Hospital Clearance & Write to Blockchain'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl text-xs text-purple-300 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Hospital clearance unlocked after Doctor medical approval sign-off.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
