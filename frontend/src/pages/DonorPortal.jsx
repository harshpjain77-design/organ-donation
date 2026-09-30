import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, HardDrive, CheckCircle2, AlertTriangle, FileText, Lock } from 'lucide-react';
import { getDonors, registerDonor, updateDonorConsent } from '../services/api';
import { PageHeader, Card, CardHeader, Button, Badge, Field, AlertBanner, TableWrap } from '../components/ui';

export default function DonorPortal({ walletState, onOpenIpfs }) {
  const [donors, setDonors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bloodGroup: 'O+',
    contact: '',
    organPledged: ['Kidney'],
  });

  const availableOrgans = ['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Cornea'];

  useEffect(() => {
    loadDonors();
  }, []);

  const loadDonors = async () => {
    try {
      const res = await getDonors();
      setDonors(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrganCheckbox = (organ) => {
    setFormData((prev) => {
      const exists = prev.organPledged.includes(organ);
      return exists
        ? { ...prev, organPledged: prev.organPledged.filter((o) => o !== organ) }
        : { ...prev, organPledged: [...prev.organPledged, organ] };
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
        walletAddress: walletState?.address || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      };
      const res = await registerDonor(payload);
      if (res.success) {
        setFormSuccess({
          donorId: res.data.donorId,
          cid: res.ipfs.cid,
          sha256: res.ipfs.sha256Hash,
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
      <PageHeader
        accent="teal"
        eyebrow="Consent"
        title="Donor registration"
        description="Pledge organs with a consent document hashed to IPFS and recorded on-chain."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="space-y-5 p-6">
          <CardHeader icon={FileText} title="Pledge consent" tone="teal" />

          {formSuccess && (
            <AlertBanner tone="emerald" icon={CheckCircle2}>
              Consent pinned. Donor <span className="font-mono">{formSuccess.donorId}</span>
              <div className="mt-1 truncate font-mono text-[11px] opacity-80">{formSuccess.cid}</div>
            </AlertBanner>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full legal name">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Eleanor Vance"
                className="ui-input"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Age">
                <input
                  type="number"
                  required
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="28"
                  className="ui-input"
                />
              </Field>
              <Field label="Blood group">
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="ui-input"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Contact">
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="donor@example.com"
                className="ui-input"
              />
            </Field>

            <Field label="Organs to pledge">
              <div className="grid grid-cols-2 gap-2">
                {availableOrgans.map((organ) => (
                  <label
                    key={organ}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                      formData.organPledged.includes(organ)
                        ? 'border-teal-400/30 bg-teal-500/10 text-white'
                        : 'border-white/10 bg-[#0b101a] text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.organPledged.includes(organ)}
                      onChange={() => handleOrganCheckbox(organ)}
                      className="accent-teal-400"
                    />
                    {organ}
                  </label>
                ))}
              </div>
            </Field>

            <div className="flex gap-2 rounded-xl border border-white/10 bg-[#0b101a] p-3 text-xs text-slate-400">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-300" />
              Submitting creates an IPFS CID and registers the hash on the ledger.
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              <ShieldCheck className="h-4 w-4" />
              {submitting ? 'Publishing…' : 'Register consent'}
            </Button>
          </form>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <CardHeader
            icon={UserCheck}
            title="Donor ledger"
            subtitle={`${donors.length} pledged`}
            tone="teal"
          />
          <TableWrap>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Blood</th>
                  <th className="pb-3 font-medium">Organs</th>
                  <th className="pb-3 font-medium">IPFS</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {donors.map((donor) => (
                  <tr key={donor.donorId} className="align-top">
                    <td className="py-3.5 font-mono text-xs text-teal-300">{donor.donorId}</td>
                    <td className="py-3.5">
                      <div className="font-medium text-white">{donor.name}</div>
                      <div className="text-xs text-slate-500">Age {donor.age}</div>
                    </td>
                    <td className="py-3.5 text-slate-200">{donor.bloodGroup}</td>
                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(donor.organPledged || []).map((org) => (
                          <Badge key={org} tone="slate">{org}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <button
                        type="button"
                        onClick={() => onOpenIpfs(donor.consentIpfsHash)}
                        className="inline-flex items-center gap-1 font-mono text-xs text-violet-300"
                      >
                        <HardDrive className="h-3 w-3" />
                        {donor.consentIpfsHash?.substring(0, 10)}…
                      </button>
                    </td>
                    <td className="py-3.5">
                      {donor.consentStatus === 'Active' ? (
                        <Badge tone="emerald">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </Badge>
                      ) : (
                        <Badge tone="rose">
                          <AlertTriangle className="h-3 w-3" /> Revoked
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <Button
                        variant="secondary"
                        className="px-2.5 py-1 text-xs"
                        onClick={() => handleToggleConsent(donor.donorId, donor.consentStatus)}
                      >
                        {donor.consentStatus === 'Active' ? 'Revoke' : 'Reactivate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </Card>
      </div>
    </div>
  );
}
