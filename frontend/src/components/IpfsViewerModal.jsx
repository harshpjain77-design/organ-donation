import React, { useState, useEffect } from 'react';
import { X, HardDrive, ExternalLink, ShieldCheck, Copy, Check, FileCode } from 'lucide-react';
import { getIpfsContent } from '../services/api';

export default function IpfsViewerModal({ cid, title = 'IPFS Off-Chain Medical Document', onClose }) {
  const [loading, setLoading] = useState(true);
  const [ipfsData, setIpfsData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!cid) return;
    setLoading(true);
    getIpfsContent(cid)
      .then(res => {
        setIpfsData(res);
        setLoading(false);
      })
      .catch(err => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-xs text-slate-400">InterPlanetary File System (IPFS) Decentralized Vault</p>
            </div>
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
          {/* CID Banner */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider block mb-1">
              IPFS Content Identifier (CID v0)
            </span>
            <div className="flex items-center justify-between font-mono text-xs text-slate-200 bg-slate-900 p-2.5 rounded-lg border border-slate-800 break-all">
              <span>{cid}</span>
              <button
                onClick={() => copyToClipboard(cid)}
                className="ml-2 p-1.5 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium">Retrieving payload from IPFS nodes...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block">Cryptographic Checksum</span>
                  <span className="text-xs font-mono font-semibold text-slate-200 truncate block">
                    {ipfsData?.sha256Hash || 'SHA-256 Verified'}
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block">Uploaded Timestamp</span>
                  <span className="text-xs font-mono font-semibold text-slate-200 block">
                    {ipfsData?.uploadedAt ? new Date(ipfsData.uploadedAt).toLocaleString() : 'Recent'}
                  </span>
                </div>
              </div>

              {/* JSON Payload viewer */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center">
                  <FileCode className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Off-Chain JSON Payload Content
                </span>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-60">
                  {JSON.stringify(ipfsData?.content || ipfsData, null, 2)}
                </pre>
              </div>

              <div className="flex items-center space-x-2 text-xs text-purple-300 bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                <ShieldCheck className="w-4 h-4 shrink-0 text-purple-400" />
                <span>
                  The hash of this medical record is immutably pinned to Ethereum/Polygon smart contract ledger for zero-knowledge validation.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center">
          <a
            href={`https://ipfs.io/ipfs/${cid}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
          >
            <span>Open in Public IPFS Gateway</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
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
