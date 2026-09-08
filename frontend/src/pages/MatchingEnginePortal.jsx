import React, { useState, useEffect } from 'react';
import { Cpu, Award, HardDrive, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, RefreshCw, BarChart2, Zap, XCircle, UserCheck, Users } from 'lucide-react';
import { getOrgans, calculateMatches, recordMatch } from '../services/api';

export default function MatchingEnginePortal({ onOpenBreakdown, onOpenIpfs, walletState }) {
  const [organs, setOrgans] = useState([]);
  const [selectedOrganId, setSelectedOrganId] = useState('');
  const [matchResults, setMatchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recordingId, setRecordingId] = useState(null);
  const [recordedMatches, setRecordedMatches] = useState({});
  const [activeCandidateTab, setActiveCandidateTab] = useState('compatible'); // 'compatible' | 'incompatible'

  useEffect(() => {
    loadOrgans();
  }, []);

  const loadOrgans = async () => {
    try {
      const res = await getOrgans();
      const list = res.data || [];
      setOrgans(list);
      if (list.length > 0) {
        setSelectedOrganId(prev => {
          if (prev && list.some(o => (o.organId || o.id) === prev)) return prev;
          return list[list.length - 1].organId || list[list.length - 1].id;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunMatching = async () => {
    if (!selectedOrganId) return;
    setLoading(true);
    try {
      const res = await calculateMatches(selectedOrganId);
      if (res.success) {
        setMatchResults(res);
      } else {
        alert('Matching error: ' + res.error);
      }
    } catch (err) {
      alert('Error triggering matching engine: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordMatchOnChain = async (candidate) => {
    setRecordingId(candidate.recipient.recipientId);
    try {
      const payload = {
        organId: matchResults.organ.organId,
        recipientId: candidate.recipient.recipientId,
        totalScore: candidate.totalScore,
        breakdown: candidate.breakdown
      };

      const res = await recordMatch(payload);
      if (res.success) {
        setRecordedMatches(prev => ({ ...prev, [candidate.recipient.recipientId]: res.data.matchId }));
        alert(`Match ${res.data.matchId} recorded to Blockchain Ledger!`);
      }
    } catch (err) {
      alert('Error recording match on chain: ' + err.message);
    } finally {
      setRecordingId(null);
    }
  };

  const currentOrgan = organs.find(o => (o.organId || o.id) === selectedOrganId);

  const compatibleList = matchResults?.matches || [];
  const incompatibleList = matchResults?.incompatibleMatches || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bento-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider font-mono">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>AI / Rule-Based Weighted Scoring Engine</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">Recipient Compatibility & Ranking Workbench</h2>
          <p className="text-xs text-slate-400 mt-1">
            Evaluates candidate recipients using the 7-parameter weighted algorithm: Blood (25%), Organ (20%), Freshness (15%), Age (10%), HLA (10%), Urgency (10%), Waiting Time (10%).
          </p>
        </div>

        <button
          onClick={loadOrgans}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 flex items-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Organs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Organ Selector */}
        <div className="lg:col-span-1 bento-card p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span>Select Donor Organ for Matching</span>
          </h3>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Available Organ Registry</label>
              <span className="text-[11px] font-mono text-cyan-400 font-bold">{organs.length} Organs</span>
            </div>
            <select
              value={selectedOrganId}
              onChange={e => setSelectedOrganId(e.target.value)}
              className="w-full bg-[#060911] border border-slate-800 rounded-xl px-3.5 py-3 text-slate-100 font-medium text-xs focus:outline-none focus:border-cyan-500"
            >
              {organs.map(o => (
                <option key={o.organId || o.id} value={o.organId || o.id}>
                  {o.organId} - {o.organType} ({o.bloodGroup}) - {o.donorName}
                </option>
              ))}
            </select>
          </div>

          {currentOrgan && (
            <div className="bg-[#060911]/90 p-4 rounded-xl border border-slate-800/90 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Organ Type</span>
                <span className="font-bold text-cyan-400 text-sm">{currentOrgan.organType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Blood Group</span>
                <span className="font-bold text-slate-200">{currentOrgan.bloodGroup}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Donor Name & Age</span>
                <span className="font-semibold text-slate-300">{currentOrgan.donorName} ({currentOrgan.donorAge || 35} yrs)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Harvest Hospital</span>
                <span className="font-semibold text-slate-300">{currentOrgan.hospitalName}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleRunMatching}
            disabled={loading || !selectedOrganId}
            className="w-full bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-extrabold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 text-xs"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Evaluating Recipient Candidates...</span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4 text-slate-950" />
                <span>Calculate Compatibility Scores</span>
              </>
            )}
          </button>
        </div>

        {/* Right Panel: Ranked Recipient Candidate Results */}
        <div className="lg:col-span-2 bento-card p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>Recipient Evaluations</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated all waitlist recipients against selected donor organ ({currentOrgan?.organType || 'Organ'})
              </p>
            </div>

            {matchResults && (
              <div className="flex bg-[#060911] p-1 rounded-xl border border-slate-800 space-x-1 text-xs">
                <button
                  onClick={() => setActiveCandidateTab('compatible')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
                    activeCandidateTab === 'compatible'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Compatible ({compatibleList.length})</span>
                </button>
                <button
                  onClick={() => setActiveCandidateTab('incompatible')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
                    activeCandidateTab === 'incompatible'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Incompatible ({incompatibleList.length})</span>
                </button>
              </div>
            )}
          </div>

          {!matchResults ? (
            <div className="p-12 text-center bg-[#060911]/80 rounded-2xl border border-slate-800/80 space-y-3">
              <Cpu className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-200">Matching Workbench Ready</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Select a donor organ from the left panel and click "Calculate Compatibility Scores" to evaluate candidate recipients.
              </p>
            </div>
          ) : activeCandidateTab === 'compatible' ? (
            compatibleList.length === 0 ? (
              <div className="p-8 text-center bg-[#060911] rounded-2xl border border-slate-800 text-slate-400 space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-200">No compatible recipients match this exact organ ({currentOrgan?.organType}).</p>
                <p className="text-xs text-slate-400">Switch to the "Incompatible" tab to inspect candidate evaluations and mismatch reasons.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {compatibleList.map((item, index) => {
                  const r = item.recipient;
                  const matchIdRecorded = recordedMatches[r.recipientId];

                  return (
                    <div key={r.recipientId} className="bg-[#060911]/90 p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold font-mono text-cyan-400 text-xs">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-bold text-white">{r.name}</h4>
                              <span className="text-[11px] font-mono text-slate-400">({r.recipientId})</span>
                            </div>
                            <div className="text-xs text-slate-400 flex items-center space-x-3 mt-0.5">
                              <span>Blood: <strong className="text-slate-200">{r.bloodGroup}</strong></span>
                              <span>•</span>
                              <span>Age: <strong className="text-slate-200">{r.age} yrs</strong></span>
                              <span>•</span>
                              <span>Urgency: <strong className="text-red-400">Status {r.urgencyLevel}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Total Score */}
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Match Score</div>
                            <div className="text-2xl font-black text-emerald-400 font-mono">{item.totalScore}%</div>
                          </div>
                          <button
                            onClick={() => onOpenBreakdown({ ...item, donorName: matchResults.donor?.name || 'Donor', organType: matchResults.organ?.organType })}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center space-x-1"
                          >
                            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Details</span>
                          </button>
                        </div>
                      </div>

                      {/* Breakdown Mini Bars */}
                      <div className="grid grid-cols-7 gap-1 pt-2 border-t border-slate-900 text-[10px]">
                        <div className="bg-[#0b0f19] p-1.5 rounded text-center">
                          <div className="text-slate-500">Blood</div>
                          <div className="font-bold text-slate-200">{item.breakdown.bloodGroupScore}/25</div>
                        </div>
                        <div className="bg-[#0b0f19] p-1.5 rounded text-center">
                          <div className="text-slate-500">Organ</div>
                          <div className="font-bold text-slate-200">{item.breakdown.organTypeScore}/20</div>
                        </div>
                        <div className="bg-[#0b0f19] p-1.5 rounded text-center">
                          <div className="text-slate-500">Fresh</div>
                          <div className="font-bold text-slate-200">{item.breakdown.availabilityScore}/15</div>
                        </div>
                        <div className="bg-[#0b0f19] p-1.5 rounded text-center">
                          <div className="text-slate-500">Age</div>
                          <div className="font-bold text-slate-200">{item.breakdown.ageDiffScore}/10</div>
                        </div>
                        <div className="bg-[#0b0f19] p-1.5 rounded text-center">
                          <div className="text-slate-500">HLA</div>
                          <div className="font-bold text-slate-200">{item.breakdown.hlaScore}/10</div>
                        </div>
                        <div className="bg-[#0b0f19] p-1.5 rounded text-center">
                          <div className="text-slate-500">Urgency</div>
                          <div className="font-bold text-slate-200">{item.breakdown.urgencyScore}/10</div>
                        </div>
                        <div className="bg-[#0b0f19] p-1.5 rounded text-center">
                          <div className="text-slate-500">Wait</div>
                          <div className="font-bold text-slate-200">{item.breakdown.waitingTimeScore}/10</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => onOpenIpfs(r.medicalReportIpfsHash)}
                          className="text-xs text-purple-400 hover:text-purple-300 font-mono flex items-center space-x-1"
                        >
                          <HardDrive className="w-3.5 h-3.5" />
                          <span>Inspect IPFS Medical Report</span>
                        </button>

                        {matchIdRecorded ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Match Recorded ({matchIdRecorded})</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRecordMatchOnChain(item)}
                            disabled={recordingId === r.recipientId}
                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center space-x-1.5"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>{recordingId === r.recipientId ? 'Recording...' : 'Record Match on Blockchain'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Incompatible Tab View */
            <div className="space-y-3">
              {incompatibleList.length === 0 ? (
                <div className="p-8 text-center bg-[#060911] rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  All registered recipients are compatible with this organ.
                </div>
              ) : (
                incompatibleList.map(item => {
                  const r = item.recipient;
                  return (
                    <div key={r.recipientId} className="bg-[#060911]/90 p-4 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{r.name}</span>
                          <span className="font-mono text-[11px] text-slate-400">({r.recipientId})</span>
                        </div>
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                          <XCircle className="w-3 h-3" />
                          <span>Incompatible</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-[11px] text-slate-400">
                        <span>Recipient Needs: <strong className="text-cyan-400">{r.organRequired}</strong></span>
                        <span>•</span>
                        <span>Blood: <strong className="text-slate-200">{r.bloodGroup}</strong></span>
                        <span>•</span>
                        <span>Age: <strong className="text-slate-200">{r.age} yrs</strong></span>
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-[11px] text-amber-300 font-medium">
                        {item.incompatibleReason || 'Incompatible organ requirement or blood group.'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
