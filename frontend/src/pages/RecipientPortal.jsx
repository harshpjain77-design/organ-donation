import React, { useState, useEffect } from 'react';
import { Users, FileText, HardDrive, CheckCircle2, AlertCircle, Clock, Plus, ShieldCheck, ChevronRight, Copy, Check } from 'lucide-react';
import { getRecipients, registerRecipient } from '../services/api';

export default function RecipientPortal({ currentRole, setActiveTab, walletState, onOpenIpfs }) {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [copiedCid, setCopiedCid] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bloodGroup: 'O+',
    organRequired: 'Kidney',
    urgencyLevel: '1',
    hlaMarkers: 'A*02:01, B*07:02, DRB1*15:01',
    hospitalName: 'St. Jude General Hospital',
    doctorName: 'Dr. Sarah Jenkins',
    medicalReportData: 'Patient exhibits End-Stage Renal Disease (ESRD). Glomerular filtration rate (eGFR) < 15 mL/min/1.73m2. Hemodialysis dependent. HLA genotyping completed.'
  });

  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    setLoading(true);
    try {
      const res = await getRecipients();
      setRecipients(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age) return;

    setSubmitting(true);
    setSuccessInfo(null);
    try {
      const payload = {
        ...formData,
        walletAddress: walletState?.address || '0x3C44CdD46a93c74263808690e0096c57199c0A14'
      };

      const res = await registerRecipient(payload);
      if (res.success) {
        setSuccessInfo({
          recipientId: res.data.recipientId,
          cid: res.ipfs.cid
        });
        setFormData({
          name: '',
          age: '',
          bloodGroup: 'O+',
          organRequired: 'Kidney',
          urgencyLevel: '1',
          hlaMarkers: 'A*02:01, B*07:02, DRB1*15:01',
          hospitalName: 'St. Jude General Hospital',
          doctorName: 'Dr. Sarah Jenkins',
          medicalReportData: 'Comprehensive clinical evaluation and lab results.'
        });
        loadRecipients();
      }
    } catch (err) {
      alert('Error registering recipient: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyCid = (cid) => {
    navigator.clipboard.writeText(cid);
    setCopiedCid(true);
    setTimeout(() => setCopiedCid(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Module Header */}
      <div className="bento-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 font-mono font-semibold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Recipient Registry Subsystem</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">Recipient Waitlist & Medical Diagnostics</h2>
          <p className="text-xs text-slate-400 mt-1">
            Medical diagnostic reports are encrypted and uploaded to IPFS. Only the hash CID is recorded on-chain.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recipient Registration Card */}
        <div className="lg:col-span-1 bento-card p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Register Patient Candidate</span>
          </h3>

          {successInfo && (
            <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl space-y-3 text-xs">
              <div className="flex items-center space-x-2 text-purple-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Recipient Registered & Medical File Pinned to IPFS!</span>
              </div>
              <div className="text-slate-300">Recipient ID: <strong className="text-white font-mono">{successInfo.recipientId}</strong></div>
              
              <div className="flex items-center justify-between font-mono text-[11px] text-purple-300 bg-[#060911] p-2 rounded-lg border border-slate-800 break-all">
                <span className="truncate">{successInfo.cid}</span>
                <button
                  onClick={() => copyCid(successInfo.cid)}
                  className="ml-1 text-slate-400 hover:text-white p-1"
                >
                  {copiedCid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {setActiveTab && (
                <button
                  onClick={() => setActiveTab('matching')}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-purple-500/10"
                >
                  <span>Evaluate Candidate in AI Engine</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Patient Legal Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Jonathan Sterling"
                className="w-full bg-[#060911] border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Age</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                  placeholder="31"
                  className="w-full bg-[#060911] border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full bg-[#060911] border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Organ Required</label>
                <select
                  value={formData.organRequired}
                  onChange={e => setFormData({ ...formData, organRequired: e.target.value })}
                  className="w-full bg-[#060911] border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
                >
                  {['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Cornea'].map(org => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Medical Urgency</label>
                <select
                  value={formData.urgencyLevel}
                  onChange={e => setFormData({ ...formData, urgencyLevel: e.target.value })}
                  className="w-full bg-[#060911] border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="1">Status 1A (Critical Emergency)</option>
                  <option value="2">Status 1B (Urgent Need)</option>
                  <option value="3">Status 2 (Moderate Need)</option>
                  <option value="4">Routine Waitlist</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">HLA Tissue Markers (6-Loci)</label>
              <input
                type="text"
                value={formData.hlaMarkers}
                onChange={e => setFormData({ ...formData, hlaMarkers: e.target.value })}
                placeholder="A*02:01, B*07:02, DRB1*15:01"
                className="w-full bg-[#060911] border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Hospital & Attending Physician</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.hospitalName}
                  onChange={e => setFormData({ ...formData, hospitalName: e.target.value })}
                  placeholder="Hospital Name"
                  className="bg-[#060911] border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
                <input
                  type="text"
                  value={formData.doctorName}
                  onChange={e => setFormData({ ...formData, doctorName: e.target.value })}
                  placeholder="Doctor Name"
                  className="bg-[#060911] border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Diagnostic Report Payload</label>
              <textarea
                rows="3"
                value={formData.medicalReportData}
                onChange={e => setFormData({ ...formData, medicalReportData: e.target.value })}
                className="w-full bg-[#060911] border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center space-x-2 text-xs"
            >
              {submitting ? (
                <span>Uploading Report to IPFS...</span>
              ) : (
                <>
                  <HardDrive className="w-4 h-4" />
                  <span>Register Recipient & Pin to IPFS</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Recipients Queue Table Card */}
        <div className="lg:col-span-2 bento-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Recipient Waiting List Queue</span>
            </h3>
            <span className="text-xs bg-[#060911] text-slate-300 px-3 py-1 rounded-full font-mono font-bold border border-slate-800">
              {recipients.length} Waiting Patients
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                  <th className="pb-3 font-semibold">Recipient ID</th>
                  <th className="pb-3 font-semibold">Patient & Organ Needed</th>
                  <th className="pb-3 font-semibold">Blood</th>
                  <th className="pb-3 font-semibold">Urgency Level</th>
                  <th className="pb-3 font-semibold">Medical Report (IPFS)</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recipients.map(r => (
                  <tr key={r.recipientId} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 font-mono text-purple-400 font-bold">{r.recipientId}</td>
                    <td className="py-3.5">
                      <div className="font-bold text-white">{r.name}</div>
                      <div className="text-slate-400 text-[11px]">
                        Need: <strong className="text-cyan-400">{r.organRequired}</strong> (Age: {r.age})
                      </div>
                    </td>
                    <td className="py-3.5 font-mono font-bold text-slate-200">{r.bloodGroup}</td>
                    <td className="py-3.5">
                      {r.urgencyLevel === 1 ? (
                        <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[11px] font-bold">
                          Status 1A (Critical)
                        </span>
                      ) : r.urgencyLevel === 2 ? (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-semibold">
                          Status 1B (Urgent)
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                          Status 2 (Moderate)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <button
                        onClick={() => onOpenIpfs(r.medicalReportIpfsHash)}
                        className="font-mono text-purple-400 hover:text-purple-300 flex items-center space-x-1 text-[11px]"
                      >
                        <HardDrive className="w-3 h-3" />
                        <span>{r.medicalReportIpfsHash?.substring(0, 10)}...</span>
                      </button>
                    </td>
                    <td className="py-3.5">
                      {r.isMatched ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center w-fit space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Matched</span>
                        </span>
                      ) : (
                        <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center w-fit space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>On Waitlist</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
