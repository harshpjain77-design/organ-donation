import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, HardDrive, CheckCircle2, AlertTriangle, FileText, Lock } from 'lucide-react';
import { getDonors, registerDonor, updateDonorConsent } from '../services/api';

export default function DonorPortal({ currentRole, setActiveTab, walletState, onOpenIpfs }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bloodGroup: 'O+',
    contact: '',
    organPledged: ['Kidney']
  });

  const availableOrgans = ['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Cornea'];

  useEffect(() => {
    loadDonors();
  }, []);

  const loadDonors = async () => {
    setLoading(true);
    try {
      const res = await getDonors();
      setDonors(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrganCheckbox = (organ) => {
    setFormData(prev => {
      const exists = prev.organPledged.includes(organ);
      if (exists) {
        return { ...prev, organPledged: prev.organPledged.filter(o => o !== organ) };
      } else {
        return { ...prev, organPledged: [...prev.organPledged, organ] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age) return;

    setSubmitting(true);
    setFormSuccess(null);
    try {
      const payload = {
        ...formData,
        walletAddress: walletState?.address || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
      };

      const res = await registerDonor(payload);
      if (res.success) {
        setFormSuccess({
          donorId: res.data.donorId,
          cid: res.ipfs.cid,
          sha256: res.ipfs.sha256Hash
        });
        setFormData({ name: '', age: '', bloodGroup: 'O+', contact: '', organPledged: ['Kidney'] });
        loadDonors();
      }
    } catch (err) {
      alert('Error registering donor: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleConsent = async (donorId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Revoked' : 'Active';
    const reason = prompt(`Reason for setting consent to ${newStatus}?`, 'User preference update');
    if (reason === null) return;

    try {
      await updateDonorConsent(donorId, newStatus, reason);
      loadDonors();
    } catch (err) {
      alert('Failed to update consent: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>Consent Management Subsystem</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Donor Registration & Immutable Consent</h2>
          <p className="text-xs text-slate-400 mt-1">
            Donors register organ pledges with digital consent documents hashed on IPFS & Ethereum/Polygon Smart Contract.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Form */}
        <div className="lg:col-span-1 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Pledge Organ Consent</span>
          </h3>

          {formSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl space-y-3 text-xs">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Donor Consent Pinned on Blockchain & IPFS!</span>
              </div>
              <p className="text-slate-300">Donor ID: <strong className="text-white font-mono">{formSuccess.donorId}</strong></p>
              <div className="font-mono text-[11px] text-purple-300 truncate">
                IPFS CID: {formSuccess.cid}
              </div>
              {setActiveTab && (
                <button
                  onClick={() => setActiveTab('matching')}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded-lg text-xs transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>Launch AI Matching Engine with Donor Organ</span>
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Eleanor Vance"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Age</label>
                <input
                  type="number"
                  required
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                  placeholder="28"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Contact Email / Phone</label>
              <input
                type="text"
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                placeholder="donor@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2">Organs to Pledge</label>
              <div className="grid grid-cols-2 gap-2">
                {availableOrgans.map(organ => (
                  <label key={organ} className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.organPledged.includes(organ)}
                      onChange={() => handleOrganCheckbox(organ)}
                      className="accent-cyan-500 rounded"
                    />
                    <span className="text-slate-200">{organ}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center space-x-1 text-slate-300 font-semibold">
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>Web3 Cryptographic Declaration</span>
              </div>
              <p>Submitting generates an IPFS legal declaration CID and registers the cryptographic hash to the Smart Contract ledger.</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <span>Publishing to IPFS & Smart Contract...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Register Consent on Blockchain</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Donors List Table */}
        <div className="lg:col-span-2 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <span>Registered Donor Ledger</span>
            </h3>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-mono font-semibold">
              {donors.length} Total Pledged Donors
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Donor ID</th>
                  <th className="pb-3 font-semibold">Name & Age</th>
                  <th className="pb-3 font-semibold">Blood</th>
                  <th className="pb-3 font-semibold">Pledged Organs</th>
                  <th className="pb-3 font-semibold">Consent Document (IPFS)</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {donors.map(donor => (
                  <tr key={donor.donorId} className="hover:bg-slate-850/50">
                    <td className="py-3.5 font-mono text-cyan-400 font-bold">{donor.donorId}</td>
                    <td className="py-3.5">
                      <div className="font-semibold text-white">{donor.name}</div>
                      <div className="text-slate-400 text-[11px]">Age: {donor.age}</div>
                    </td>
                    <td className="py-3.5 font-bold text-slate-200">{donor.bloodGroup}</td>
                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(donor.organPledged || []).map(org => (
                          <span key={org} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                            {org}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <button
                        onClick={() => onOpenIpfs(donor.consentIpfsHash)}
                        className="font-mono text-purple-400 hover:text-purple-300 flex items-center space-x-1 text-[11px]"
                      >
                        <HardDrive className="w-3 h-3" />
                        <span>{donor.consentIpfsHash?.substring(0, 10)}...</span>
                      </button>
                    </td>
                    <td className="py-3.5">
                      {donor.consentStatus === 'Active' ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center w-fit space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active Consent</span>
                        </span>
                      ) : (
                        <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center w-fit space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Revoked</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleToggleConsent(donor.donorId, donor.consentStatus)}
                        className="text-slate-400 hover:text-white text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700"
                      >
                        {donor.consentStatus === 'Active' ? 'Revoke' : 'Reactivate'}
                      </button>
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
