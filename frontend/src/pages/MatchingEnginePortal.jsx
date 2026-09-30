import React, { useState, useEffect } from 'react';
import { Cpu, Award, HardDrive, CheckCircle2, AlertCircle, RefreshCw, BarChart2, ShieldCheck } from 'lucide-react';
import { getOrgans, calculateMatches, recordMatch } from '../services/api';
import { PageHeader, Card, CardHeader, Button, Badge, Field, EmptyState } from '../components/ui';

export default function MatchingEnginePortal({ onOpenBreakdown, onOpenIpfs }) {
  const [organs, setOrgans] = useState([]);
  const [selectedOrganId, setSelectedOrganId] = useState('');
  const [matchResults, setMatchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recordingId, setRecordingId] = useState(null);
  const [recordedMatches, setRecordedMatches] = useState({});

  useEffect(() => {
    loadOrgans();
  }, []);

  const loadOrgans = async () => {
    try {
      const res = await getOrgans();
      const list = res.data || [];
      setOrgans(list);
      if (list.length > 0) {
        setSelectedOrganId(list[0].organId || list[0].id);
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
      if (res.success) setMatchResults(res);
      else alert('Matching error: ' + res.error);
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
        breakdown: candidate.breakdown,
      };
      const res = await recordMatch(payload);
      if (res.success) {
        setRecordedMatches((prev) => ({ ...prev, [candidate.recipient.recipientId]: res.data.matchId }));
      }
    } catch (err) {
      alert('Error recording match on chain: ' + err.message);
    } finally {
      setRecordingId(null);
    }
  };

  const currentOrgan = organs.find((o) => (o.organId || o.id) === selectedOrganId);

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        accent="cyan"
        eyebrow="Matching"
        title="Compatibility ranking"
        description="Blood 25% · Organ 20% · Freshness 15% · Age 10% · HLA 10% · Urgency 10% · Wait 10%."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="space-y-5 p-6">
          <CardHeader icon={BarChart2} title="Harvested organ" tone="cyan" />
          <Field label="Select organ">
            <select
              value={selectedOrganId}
              onChange={(e) => setSelectedOrganId(e.target.value)}
              className="ui-input"
            >
              {organs.map((o) => (
                <option key={o.organId || o.id} value={o.organId || o.id}>
                  {o.organId} — {o.organType} ({o.bloodGroup}) · {o.donorName}
                </option>
              ))}
            </select>
          </Field>

          {currentOrgan && (
            <div className="space-y-2 rounded-xl border border-white/10 bg-[#0b101a] p-4 text-sm">
              {[
                ['Type', currentOrgan.organType],
                ['Blood', currentOrgan.bloodGroup],
                ['Donor', `${currentOrgan.donorName} (${currentOrgan.donorAge || 35})`],
                ['Hospital', currentOrgan.hospitalName],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-right text-slate-200">{v}</span>
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleRunMatching} disabled={loading || !selectedOrganId} className="w-full">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
            {loading ? 'Scoring…' : 'Run matching'}
          </Button>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <CardHeader
            icon={Award}
            title="Ranked candidates"
            subtitle="Weighted 7-parameter scores"
            tone="emerald"
            action={
              matchResults && (
                <Badge tone="emerald">{matchResults.matches?.length || 0} evaluated</Badge>
              )
            }
          />

          {!matchResults ? (
            <EmptyState
              icon={Cpu}
              title="Ready to rank"
              description="Select an organ and run matching to see ranked recipients."
            />
          ) : matchResults.matches?.length === 0 ? (
            <EmptyState icon={AlertCircle} title="No compatible recipients" description="No waitlist candidates scored for this organ." />
          ) : (
            <div className="space-y-3">
              {matchResults.matches.map((item, index) => {
                const r = item.recipient;
                const matchIdRecorded = recordedMatches[r.recipientId];
                return (
                  <div key={r.recipientId} className="space-y-3 rounded-2xl border border-white/10 bg-[#0b101a]/80 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 font-mono text-xs text-teal-300">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {r.name} <span className="font-mono text-xs text-slate-500">{r.recipientId}</span>
                          </p>
                          <p className="text-xs text-slate-500">
                            {r.bloodGroup} · {r.age} yrs · Urgency {r.urgencyLevel}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-mono text-2xl font-semibold text-emerald-300">{item.totalScore}%</p>
                        <Button
                          variant="secondary"
                          className="px-3 py-1.5 text-xs"
                          onClick={() =>
                            onOpenBreakdown({
                              ...item,
                              donorName: matchResults.donor?.name || 'Donor',
                              organType: matchResults.organ?.organType,
                            })
                          }
                        >
                          Details
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500">
                      {[
                        ['Blood', `${item.breakdown.bloodGroupScore}/25`],
                        ['Organ', `${item.breakdown.organTypeScore}/20`],
                        ['Fresh', `${item.breakdown.availabilityScore}/15`],
                        ['Age', `${item.breakdown.ageDiffScore}/10`],
                        ['HLA', `${item.breakdown.hlaScore}/10`],
                        ['Urg.', `${item.breakdown.urgencyScore}/10`],
                        ['Wait', `${item.breakdown.waitingTimeScore}/10`],
                      ].map(([label, val]) => (
                        <div key={label} className="rounded-lg bg-white/5 py-1.5">
                          <div>{label}</div>
                          <div className="font-medium text-slate-200">{val}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenIpfs(r.medicalReportIpfsHash)}
                        className="inline-flex items-center gap-1 text-xs text-violet-300"
                      >
                        <HardDrive className="h-3.5 w-3.5" />
                        Medical report
                      </button>
                      {matchIdRecorded ? (
                        <Badge tone="emerald">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Recorded {matchIdRecorded}
                        </Badge>
                      ) : (
                        <Button
                          className="text-xs"
                          onClick={() => handleRecordMatchOnChain(item)}
                          disabled={recordingId === r.recipientId}
                        >
                          <ShieldCheck className="h-4 w-4" />
                          {recordingId === r.recipientId ? 'Recording…' : 'Record on chain'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
