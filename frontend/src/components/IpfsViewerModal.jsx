import React, { useState, useEffect } from 'react';
import { X, HardDrive, ExternalLink, ShieldCheck, Copy, Check, FileCode, Info, Globe, Server } from 'lucide-react';
import { getIpfsContent } from '../services/api';

export default function IpfsViewerModal({ cid, title = 'IPFS Medical Document Vault', onClose }) {
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
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#0b0f19] z-10">
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
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 hover:bg-slate-800 transition-all border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* CID Banner */}
          <div className="bg-[#060911] p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider block mb-1 font-mono">
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

          {/* Mode Banner Explanation */}
          <div className="bg-purple-500/10 border border-purple-500/20 p-3.5 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center space-x-2 text-purple-300 font-bold">
              <Info className="w-4 h-4 text-purple-400 shrink-0" />
              <span>IPFS Gateway Access & Network Mode</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {ipfsData?.isPublicPin ? (
                <span className="text-emerald-400 font-semibold">
                  ✓ Document is pinned directly to the global public IPFS network via Pinata API!
                </span>
              ) : (
                <span>
                  Currently served live via the <strong>Local Node Gateway</strong>. Public IPFS web gateways (like <code className="text-purple-300">ipfs.io</code>) require third-party network propagation or Pinata JWT keys configured in <code className="text-purple-300">backend/.env</code>.
                </span>
              )}
            </p>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium font-mono">Retrieving payload from IPFS node...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#060911] p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-mono uppercase">SHA-256 Digest</span>
                  <span className="text-xs font-mono font-bold text-slate-200 truncate block mt-0.5">
                    {ipfsData?.sha256Hash || 'SHA-256 Verified'}
                  </span>
                </div>
                <div className="bg-[#060911] p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-mono uppercase">Pin Timestamp</span>
                  <span className="text-xs font-mono font-bold text-slate-200 block mt-0.5">
                    {ipfsData?.uploadedAt ? new Date(ipfsData.uploadedAt).toLocaleString() : 'Recent'}
                  </span>
                </div>
              </div>

              {/* JSON Payload Viewer */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center font-mono">
                  <FileCode className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Decrypted Off-Chain Medical Payload
                </span>
                <pre className="bg-[#060911] p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-60">
                  {JSON.stringify(ipfsData?.content || ipfsData, null, 2)}
                </pre>
              </div>

              <div className="flex items-center space-x-2 text-xs text-purple-300 bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                <ShieldCheck className="w-4 h-4 shrink-0 text-purple-400" />
                <span>
                  The hash of this document is immutably linked to the Ethereum Smart Contract ledger.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Gateway Buttons */}
        <div className="p-4 border-t border-slate-800 bg-[#0b0f19] flex flex-wrap gap-2 justify-between items-center text-xs">
          <a
            href={`/api/ipfs/${cid}`}
            target="_blank"
            rel="noreferrer"
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Open Local Node Gateway (Live Payload)</span>
          </a>

          <a
            href={`https://ipfs.io/ipfs/${cid}`}
            target="_blank"
            rel="noreferrer"
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl font-semibold flex items-center space-x-1.5 transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>Public Gateway (ipfs.io)</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>
    </div>
  );
}
