import React, { useState, useEffect } from 'react';
import { X, HardDrive, ExternalLink, ShieldCheck, Copy, Check, FileCode } from 'lucide-react';
import { getIpfsContent } from '../services/api';
import { Button } from './ui';

export default function IpfsViewerModal({ cid, title = 'IPFS medical document', onClose }) {
  const [loading, setLoading] = useState(true);
  const [ipfsData, setIpfsData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!cid) return;
    setLoading(true);
    getIpfsContent(cid)
      .then((res) => {
        setIpfsData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [cid]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!cid) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e16]/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="ui-card max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#101622]/95 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-xs text-slate-500">Decentralized document vault</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-xl border border-white/10 bg-[#0b101a] p-4">
            <p className="mb-2 text-[11px] uppercase tracking-wide text-violet-300">Content ID</p>
            <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#080c14] p-2.5 font-mono text-xs text-slate-200">
              <span className="break-all">{cid}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(cid)}
                className="shrink-0 rounded-md bg-white/5 p-1.5 text-slate-400 hover:text-white"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-12 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
              <p className="text-xs">Retrieving payload…</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-[#0b101a] p-3">
                  <p className="text-[11px] text-slate-500">Checksum</p>
                  <p className="truncate font-mono text-xs text-slate-200">{ipfsData?.sha256Hash || 'SHA-256'}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b101a] p-3">
                  <p className="text-[11px] text-slate-500">Uploaded</p>
                  <p className="font-mono text-xs text-slate-200">
                    {ipfsData?.uploadedAt ? new Date(ipfsData.uploadedAt).toLocaleString() : 'Recent'}
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-2 flex items-center text-[11px] uppercase tracking-wide text-slate-500">
                  <FileCode className="mr-1.5 h-3.5 w-3.5" /> Payload
                </p>
                <pre className="max-h-60 overflow-x-auto rounded-xl border border-white/10 bg-[#0b101a] p-4 font-mono text-xs text-teal-200">
                  {JSON.stringify(ipfsData?.content || ipfsData, null, 2)}
                </pre>
              </div>
              <div className="flex gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 p-3 text-xs text-violet-200">
                <ShieldCheck className="h-4 w-4 shrink-0 text-violet-300" />
                Record hash is pinned on-chain for verification.
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
          <a
            href={`https://ipfs.io/ipfs/${cid}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-violet-300 hover:text-violet-200"
          >
            Public gateway <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
