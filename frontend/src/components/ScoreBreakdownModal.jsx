import React from 'react';
import { X, CheckCircle2, ShieldAlert, Award, Info } from 'lucide-react';

export default function ScoreBreakdownModal({ match, onClose }) {
  if (!match) return null;

  const { breakdown, totalScore, recipientName, organType, donorName } = match;

  const parameters = [
    {
      name: 'Blood Group Compatibility',
      weight: '25%',
      maxScore: 25,
      actualScore: breakdown?.bloodGroupScore ?? 25,
      description: 'Strict ABO/Rh blood group compatibility check',
      color: 'from-rose-500 to-red-600'
    },
    {
      name: 'Organ Type Match',
      weight: '20%',
      maxScore: 20,
      actualScore: breakdown?.organTypeScore ?? 20,
      description: 'Donor organ type matches recipient requirement',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      name: 'Organ Availability / Freshness',
      weight: '15%',
      maxScore: 15,
      actualScore: breakdown?.availabilityScore ?? 15,
      description: 'Time elapsed since organ harvest (cold ischemia window)',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      name: 'Age Discrepancy',
      weight: '10%',
      maxScore: 10,
      actualScore: breakdown?.ageDiffScore ?? 10,
      description: 'Prefers lower age delta between donor and recipient',
      color: 'from-amber-500 to-orange-600'
    },
    {
      name: 'HLA Tissue Compatibility',
      weight: '10%',
      maxScore: 10,
      actualScore: breakdown?.hlaScore ?? 10,
      description: '6-locus tissue antigen matching ratio (HLA-A, B, DR)',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      name: 'Medical Urgency',
      weight: '10%',
      maxScore: 10,
      actualScore: breakdown?.urgencyScore ?? 10,
      description: 'Prioritizes Status 1A/Critical emergency patients',
      color: 'from-red-500 to-rose-600'
    },
    {
      name: 'Waiting List Duration',
      weight: '10%',
      maxScore: 10,
      actualScore: breakdown?.waitingTimeScore ?? 10,
      description: 'Grants priority for time elapsed on waiting list',
      color: 'from-sky-500 to-cyan-600'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div>
            <div className="flex items-center space-x-2">
              <Award className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">Weighted Score Breakdown</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Match between <strong className="text-slate-200">{donorName || 'Donor'}</strong> ({organType}) & <strong className="text-slate-200">{recipientName || 'Recipient'}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Aggregate Badge */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Overall Compatibility Index</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-extrabold text-white">{totalScore}%</span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> High Compatibility Match
                </span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center">
              <span className="text-cyan-400 font-extrabold text-lg">{Math.round(totalScore)}</span>
            </div>
          </div>

          {/* 7 Parameter Rules List */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">7 Weighted Scoring Criteria</h4>
            {parameters.map((param, index) => {
              const scorePercent = (param.actualScore / param.maxScore) * 100;
              return (
                <div key={index} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {param.weight}
                      </span>
                      <span className="text-sm font-medium text-white">{param.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {param.actualScore} / {param.maxScore} pts
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-2">
                    <div
                      className={`h-full bg-gradient-to-r ${param.color} transition-all duration-500`}
                      style={{ width: `${scorePercent}%` }}
                    ></div>
                  </div>

                  <p className="text-xs text-slate-400">{param.description}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl flex items-start space-x-3">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-xs text-cyan-200 leading-relaxed">
              This score is calculated by the decentralized engine based on medical criteria specifications. Final transplant authorization requires dual sign-off from an authorized Doctor and Hospital.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
