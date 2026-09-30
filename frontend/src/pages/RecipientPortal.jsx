import React, { useState, useEffect } from 'react';
import { FileText, HardDrive, CheckCircle2, Clock, Plus } from 'lucide-react';
import { getRecipients, registerRecipient } from '../services/api';
import { PageHeader, Card, CardHeader, Button, Badge, Field, AlertBanner, TableWrap } from '../components/ui';

export default function RecipientPortal({ walletState, onOpenIpfs }) {
  const [recipients, setRecipients] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bloodGroup: 'O+',
    organRequired: 'Kidney',
    urgencyLevel: '1',
    hlaMarkers: 'A*02:01, B*07:02, DRB1*15:01',
    hospitalName: 'St. Jude General Hospital',
    doctorName: 'Dr. Sarah Jenkins',
    medicalReportData:
      'Patient exhibits End-Stage Renal Disease (ESRD). Glomerular filtration rate (eGFR) < 15 mL/min/1.73m2. Hemodialysis dependent. HLA genotyping completed.',
  });

  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    try {
      const res = await getRecipients();
      setRecipients(res.data || []);
    } catch (err) {
      console.error(err);
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
        walletAddress: walletState?.address || '0x3C44CdD46a93c74263808690e0096c57199c0A14',
      };
      const res = await registerRecipient(payload);
      if (res.success) {
        setSuccessInfo({ recipientId: res.data.recipientId, cid: res.ipfs.cid });
        setFormData({
          name: '',
          age: '',
          bloodGroup: 'O+',
          organRequired: 'Kidney',
          urgencyLevel: '1',
          hlaMarkers: 'A*02:01, B*07:02, DRB1*15:01',
          hospitalName: 'St. Jude General Hospital',
          doctorName: 'Dr. Sarah Jenkins',
          medicalReportData: 'Comprehensive clinical evaluation and lab results.',
        });
        loadRecipients();
      }
    } catch (err) {
      alert('Error registering recipient: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        accent="purple"
        eyebrow="Waitlist"
        title="Recipient registry"
        description="Medical reports stay on IPFS. Only the hash is stored on-chain."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="space-y-5 p-6">
          <CardHeader icon={Plus} title="Register patient" tone="purple" />

          {successInfo && (
            <AlertBanner tone="purple" icon={CheckCircle2}>
              Registered <span className="font-mono">{successInfo.recipientId}</span>
              <div className="mt-1 truncate font-mono text-[11px] opacity-80">{successInfo.cid}</div>
            </AlertBanner>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Patient name">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Jonathan Sterling"
                className="ui-input"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Age">
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
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

            <div className="grid grid-cols-2 gap-3">
              <Field label="Organ needed">
                <select
                  value={formData.organRequired}
                  onChange={(e) => setFormData({ ...formData, organRequired: e.target.value })}
                  className="ui-input"
                >
                  {['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Cornea'].map((org) => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </Field>
              <Field label="Urgency">
                <select
                  value={formData.urgencyLevel}
                  onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                  className="ui-input"
                >
                  <option value="1">1A Critical</option>
                  <option value="2">1B Urgent</option>
                  <option value="3">Status 2</option>
                  <option value="4">Routine</option>
                </select>
              </Field>
            </div>

            <Field label="HLA markers">
              <input
                type="text"
                value={formData.hlaMarkers}
                onChange={(e) => setFormData({ ...formData, hlaMarkers: e.target.value })}
                className="ui-input font-mono text-xs"
              />
            </Field>

            <Field label="Hospital & physician">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  className="ui-input"
                />
                <input
                  type="text"
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  className="ui-input"
                />
              </div>
            </Field>

            <Field label="Medical report">
              <textarea
                rows="3"
                value={formData.medicalReportData}
                onChange={(e) => setFormData({ ...formData, medicalReportData: e.target.value })}
                className="ui-input"
              />
            </Field>

            <Button type="submit" variant="purple" disabled={submitting} className="w-full">
              <HardDrive className="h-4 w-4" />
              {submitting ? 'Uploading…' : 'Register & pin to IPFS'}
            </Button>
          </form>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <CardHeader icon={FileText} title="Waiting list" subtitle={`${recipients.length} candidates`} tone="purple" />
          <TableWrap>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Patient</th>
                  <th className="pb-3 font-medium">Blood</th>
                  <th className="pb-3 font-medium">Urgency</th>
                  <th className="pb-3 font-medium">Report</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recipients.map((r) => (
                  <tr key={r.recipientId}>
                    <td className="py-3.5 font-mono text-xs text-violet-300">{r.recipientId}</td>
                    <td className="py-3.5">
                      <div className="font-medium text-white">{r.name}</div>
                      <div className="text-xs text-slate-500">
                        {r.organRequired} · Age {r.age}
                      </div>
                    </td>
                    <td className="py-3.5">{r.bloodGroup}</td>
                    <td className="py-3.5">
                      {r.urgencyLevel === 1 ? (
                        <Badge tone="rose">1A Critical</Badge>
                      ) : r.urgencyLevel === 2 ? (
                        <Badge tone="amber">1B Urgent</Badge>
                      ) : (
                        <Badge>Status 2</Badge>
                      )}
                    </td>
                    <td className="py-3.5">
                      <button
                        type="button"
                        onClick={() => onOpenIpfs(r.medicalReportIpfsHash)}
                        className="inline-flex items-center gap-1 font-mono text-xs text-violet-300"
                      >
                        <HardDrive className="h-3 w-3" />
                        {r.medicalReportIpfsHash?.substring(0, 10)}…
                      </button>
                    </td>
                    <td className="py-3.5">
                      {r.isMatched ? (
                        <Badge tone="emerald">
                          <CheckCircle2 className="h-3 w-3" /> Matched
                        </Badge>
                      ) : (
                        <Badge tone="cyan">
                          <Clock className="h-3 w-3" /> Waitlist
                        </Badge>
                      )}
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
