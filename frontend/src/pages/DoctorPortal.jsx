import React, { useState, useEffect } from 'react';
import { Stethoscope, CheckCircle2, HardDrive, Clock, ShieldCheck, Award, FileText, Lock, AlertCircle } from 'lucide-react';
import { getMatches, approveByDoctor } from '../services/api';

export default function DoctorPortal({ currentRole, walletState, onOpenIpfs, onOpenBreakdown }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [doctorNotesMap, setDoctorNotesMap] = useState({});

  const isDoctorSession = currentRole === 'Doctor' || currentRole === 'Admin';

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const res = await getMatches();
      setMatches(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Verification Subsystem</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Doctor Workbench & Medical Sign-Off</h2>
          <p className="text-xs text-slate-400 mt-1">
            Doctors inspect candidate medical files from IPFS and sign digital approvals before hospital clearance.
          </p>
        </div>
      </div>

      {/* Role Session Banner */}
      {!isDoctorSession ? (
        <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl flex items-center space-x-3 text-xs">
          <AlertCircle className="w-5 h-5 text-purple-400 shrink-0" />
          <div className="text-purple-200">
            <strong className="font-bold text-white">Preview Mode: </strong>
            You are currently viewing Doctor Workbench from the <span className="underline font-semibold">{currentRole}</span> perspective. Switch active perspective to <strong className="text-purple-400 font-semibold">Doctor Workbench</strong> in the top header bar to sign off approvals.
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Authorized Doctor Session Active (Wallet: <span className="font-mono">{walletState.address.substring(0, 8)}...</span>)</span>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono text-[11px]">Attending Physician Role</span>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>Matches Requiring Medical Verification</span>
          </h3>
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-mono">
            {matches.filter(m => m.status === 'Pending').length} Pending Verification
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/80 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
            <Stethoscope className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold">No matches queued for doctor verification.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map(m => (
              <div key={m.matchId || m.id} className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-mono text-xs text-cyan-400 font-bold">{m.matchId}</span>
                    <h4 className="text-base font-bold text-white mt-0.5">{m.organType} Match</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Score</span>
                    <span className="text-xl font-extrabold text-emerald-400">{m.totalScore}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Donor Information</span>
                    <span className="font-bold text-white block mt-0.5">{m.donorName || m.donorId}</span>
                    <span className="text-slate-400 font-mono text-[11px] block">{m.organId}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Recipient Patient</span>
                    <span className="font-bold text-white block mt-0.5">{m.recipientName || m.recipientId}</span>
                    <span className="text-slate-400 font-mono text-[11px] block">{m.recipientId}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() => onOpenBreakdown(m)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>View 7-Score Breakdown</span>
                  </button>

                  <button
                    onClick={() => onOpenIpfs('QmPZ9gcawA221BaGwtw272hsLtGfLwGfL29G9G112hHs12')}
                    className="text-purple-400 hover:text-purple-300 font-mono text-[11px] flex items-center space-x-1"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Inspect IPFS Report</span>
                  </button>
                </div>

                {/* Status or Doctor Action */}
                {m.doctorApproved ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Doctor Verification Signed</span>
                    </div>
                    <p className="text-slate-300 text-[11px] font-mono truncate">Notes: {m.doctorNotes}</p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <textarea
                      rows="2"
                      placeholder="Doctor medical verification notes & laboratory cross-match sign-off..."
                      value={doctorNotesMap[m.matchId] || ''}
                      onChange={e => setDoctorNotesMap({ ...doctorNotesMap, [m.matchId]: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    ></textarea>

                    <button
                      onClick={() => handleDoctorApprove(m.matchId)}
                      disabled={approvingId === m.matchId}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center space-x-2"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>{approvingId === m.matchId ? 'Signing Approval...' : 'Sign Doctor Medical Approval'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
