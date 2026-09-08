const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function loginUser(walletAddress, role) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, role })
  });
  return res.json();
}

// Donors
export async function getDonors() {
  const res = await fetch(`${API_BASE}/donors`);
  return res.json();
}

export async function registerDonor(donorData) {
  const res = await fetch(`${API_BASE}/donors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donorData)
  });
  return res.json();
}

export async function updateDonorConsent(donorId, status, reason) {
  const res = await fetch(`${API_BASE}/donors/${donorId}/consent`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, reason })
  });
  return res.json();
}

// Recipients
export async function getRecipients() {
  const res = await fetch(`${API_BASE}/recipients`);
  return res.json();
}

export async function registerRecipient(recipientData) {
  const res = await fetch(`${API_BASE}/recipients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipientData)
  });
  return res.json();
}

// Organs
export async function getOrgans() {
  const res = await fetch(`${API_BASE}/organs`);
  return res.json();
}

export async function listOrgan(organData) {
  const res = await fetch(`${API_BASE}/organs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(organData)
  });
  return res.json();
}

// Matching Engine
export async function calculateMatches(organId) {
  const res = await fetch(`${API_BASE}/match/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ organId })
  });
  return res.json();
}

export async function recordMatch(matchPayload) {
  const res = await fetch(`${API_BASE}/match/record`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(matchPayload)
  });
  return res.json();
}

export async function getMatches() {
  const res = await fetch(`${API_BASE}/matches`);
  return res.json();
}

// Approvals
export async function approveByDoctor(matchId, doctorNotes, doctorAddress) {
  const res = await fetch(`${API_BASE}/approvals/doctor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId, doctorNotes, doctorAddress })
  });
  return res.json();
}

export async function approveByHospital(matchId, hospitalNotes, hospitalAddress) {
  const res = await fetch(`${API_BASE}/approvals/hospital`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId, hospitalNotes, hospitalAddress })
  });
  return res.json();
}

// Audit Trail
export async function getAuditTrail() {
  const res = await fetch(`${API_BASE}/audit`);
  return res.json();
}

// IPFS Gateway
export async function getIpfsContent(cid) {
  const res = await fetch(`${API_BASE}/ipfs/${cid}`);
  return res.json();
}
