import React from 'react';
import { X, CheckCircle2, Award, Info } from 'lucide-react';
import { Badge, Button } from './ui';

export default function ScoreBreakdownModal({ match, onClose }) {
  if (!match) return null;

  const { breakdown, totalScore, recipientName, organType, donorName } = match;

  const parameters = [
    { name: 'Blood group', weight: '25%', maxScore: 25, actualScore: breakdown?.bloodGroupScore ?? 25, description: 'ABO/Rh compatibility', color: 'bg-rose-400' },
    { name: 'Organ type', weight: '20%', maxScore: 20, actualScore: breakdown?.organTypeScore ?? 20, description: 'Required organ matches harvest', color: 'bg-violet-400' },
    { name: 'Freshness', weight: '15%', maxScore: 15, actualScore: breakdown?.availabilityScore ?? 15, description: 'Cold ischemia window', color: 'bg-cyan-400' },
    { name: 'Age delta', weight: '10%', maxScore: 10, actualScore: breakdown?.ageDiffScore ?? 10, description: 'Donor–recipient age gap', color: 'bg-amber-400' },
    { name: 'HLA tissue', weight: '10%', maxScore: 10, actualScore: breakdown?.hlaScore ?? 10, description: '6-locus antigen match', color: 'bg-emerald-400' },
    { name: 'Urgency', weight: '10%', maxScore: 10, actualScore: breakdown?.urgencyScore ?? 10, description: 'Clinical priority status', color: 'bg-rose-400' },
    { name: 'Wait time', weight: '10%', maxScore: 10, actualScore: breakdown?.waitingTimeScore ?? 10, description: 'Time on the waitlist', color: 'bg-sky-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e16]/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="ui-card max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#101622]/95 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-teal-300" />
              <h3 className="text-lg font-semibold text-white">Score breakdown</h3>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {donorName || 'Donor'} ({organType}) → {recipientName || 'Recipient'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b101a] p-5">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Compatibility</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-white">{totalScore}%</span>
                <Badge tone="emerald">
                  <CheckCircle2 className="h-3.5 w-3.5" /> High match
                </Badge>
              </div>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-teal-400/30 bg-teal-500/10 font-mono text-lg text-teal-300">
              {Math.round(totalScore)}
            </div>
          </div>

          <div className="space-y-3">
            {parameters.map((param) => {
              const scorePercent = (param.actualScore / param.maxScore) * 100;
              return (
                <div key={param.name} className="rounded-xl border border-white/10 bg-[#0b101a] p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge>{param.weight}</Badge>
                      <span className="text-sm text-white">{param.name}</span>
                    </div>
                    <span className="font-mono text-xs text-slate-300">
                      {param.actualScore}/{param.maxScore}
                    </span>
                  </div>
                  <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full ${param.color}`} style={{ width: `${scorePercent}%` }} />
                  </div>
                  <p className="text-xs text-slate-500">{param.description}</p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 rounded-xl border border-teal-400/20 bg-teal-500/10 p-4 text-sm text-teal-100">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
            Final transplant still requires doctor and hospital sign-off.
          </div>
        </div>

        <div className="flex justify-end border-t border-white/10 px-6 py-4">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
