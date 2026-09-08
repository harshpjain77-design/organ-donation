const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { connectDB, memoryStore } = require('./config/db');
const { initializeSeedData } = require('./store/seedData');
const { calculateCompatibility, rankRecipientsForOrgan } = require('./services/matchingEngine');
const { uploadToIpfs, getFromIpfs } = require('./services/ipfsService');
const { logAuditOnChain, getAuditTrail } = require('./services/blockchainService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'organ_donation_secret_key_2026';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize DB & Seed Data
connectDB().then(() => {
  initializeSeedData();
});

// Middleware for JWT Authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next(); // Fallback for local demo simplicity

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) req.user = user;
    next();
  });
}

app.use(authenticateToken);

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Decentralized Organ Donor & Recipient Matcher API',
    timestamp: new Date().toISOString(),
    blockchainConnected: true,
    ipfsReady: true
  });
});

// Auth Route
app.post('/api/auth/login', (req, res) => {
  const { walletAddress, role } = req.body;
  const token = jwt.sign({ walletAddress, role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({
    token,
    user: {
      walletAddress,
      role: role || 'User',
      name: `${role || 'User'} (${walletAddress ? walletAddress.substring(0, 6) + '...' : '0x...'})`
    }
  });
});

// 1. Donors API
app.get('/api/donors', (req, res) => {
  res.json({ success: true, count: memoryStore.donors.length, data: memoryStore.donors });
});

app.post('/api/donors', async (req, res) => {
  try {
    const { name, age, bloodGroup, contact, organPledged, walletAddress } = req.body;
    const donorId = `DNR-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create consent document & upload to IPFS
    const consentDoc = {
      donorId,
      name,
      age,
      bloodGroup,
      organPledged,
      consentGranted: true,
      legalDeclaration: "I hereby voluntarily pledge my organs for post-mortem organ donation.",
      signedAt: new Date().toISOString(),
      walletAddress: walletAddress || '0x...'
    };

    const ipfsResult = await uploadToIpfs(consentDoc, `${donorId}_consent.json`);

    const newDonor = {
      id: donorId,
      donorId,
      name,
      age: Number(age),
      bloodGroup,
      contact,
      organPledged: Array.isArray(organPledged) ? organPledged : [organPledged],
      consentStatus: 'Active',
      consentIpfsHash: ipfsResult.cid,
      walletAddress,
      registeredAt: new Date().toISOString()
    };

    memoryStore.donors.push(newDonor);

    // Automatically list pledged organs for matching engine availability
    newDonor.organPledged.forEach(organType => {
      const organId = `ORG-${Math.floor(1000 + Math.random() * 9000)}`;
      memoryStore.organs.push({
        id: organId,
        organId,
        donorId,
        donorName: name,
        donorAge: Number(age),
        organType,
        bloodGroup,
        harvestTimestamp: new Date().toISOString(),
        hospitalName: 'General Hospital',
        status: 'Available'
      });
    });

    // Record on Blockchain Audit Trail
    await logAuditOnChain(
      'CONSENT_REGISTERED',
      donorId,
      walletAddress,
      ipfsResult.cid,
      `Donor ${name} pledged organs [${newDonor.organPledged.join(', ')}]`
    );

    res.status(201).json({ success: true, data: newDonor, ipfs: ipfsResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/donors/:id/consent', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const donor = memoryStore.donors.find(d => d.donorId === id || d.id === id);
    if (!donor) return res.status(404).json({ success: false, error: 'Donor not found' });

    donor.consentStatus = status;

    const auditEvent = status === 'Active' ? 'CONSENT_UPDATED' : 'CONSENT_REVOKED';
    await logAuditOnChain(
      auditEvent,
      donor.donorId,
      donor.walletAddress,
      donor.consentIpfsHash,
      `Donor consent status changed to ${status}. Reason: ${reason || 'User action'}`
    );

    res.json({ success: true, data: donor });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Recipients API
app.get('/api/recipients', (req, res) => {
  res.json({ success: true, count: memoryStore.recipients.length, data: memoryStore.recipients });
});

app.post('/api/recipients', async (req, res) => {
  try {
    const {
      name,
      age,
      bloodGroup,
      organRequired,
      urgencyLevel,
      hlaMarkers,
      hospitalName,
      doctorName,
      medicalReportData,
      walletAddress
    } = req.body;

    const recipientId = `RCP-${Math.floor(1000 + Math.random() * 9000)}`;

    // Upload medical report payload to IPFS
    const reportPayload = {
      recipientId,
      name,
      age,
      organRequired,
      bloodGroup,
      urgencyLevel,
      hlaMarkers,
      clinicalSummary: medicalReportData || 'Comprehensive organ failure diagnostic report',
      hospitalName,
      doctorName,
      uploadedAt: new Date().toISOString()
    };

    const ipfsResult = await uploadToIpfs(reportPayload, `${recipientId}_medical_report.json`);

    const newRecipient = {
      id: recipientId,
      recipientId,
      name,
      age: Number(age),
      bloodGroup,
      organRequired,
      urgencyLevel: Number(urgencyLevel || 2),
      urgencyLabel: urgencyLevel == 1 ? 'Status 1A (Critical)' : urgencyLevel == 2 ? 'Status 1B (Urgent)' : 'Status 2 (Moderate)',
      hlaMarkers: hlaMarkers || 'A*02:01, B*07:02, DRB1*15:01',
      medicalReportIpfsHash: ipfsResult.cid,
      hospitalName: hospitalName || 'General Hospital',
      doctorName: doctorName || 'Attending Physician',
      registerTimestamp: new Date().toISOString(),
      isMatched: false
    };

    memoryStore.recipients.push(newRecipient);

    // Record on Blockchain Audit Trail
    await logAuditOnChain(
      'RECIPIENT_REGISTERED',
      recipientId,
      walletAddress,
      ipfsResult.cid,
      `Recipient ${name} registered for ${organRequired} with IPFS Medical Hash ${ipfsResult.cid}`
    );

    res.status(201).json({ success: true, data: newRecipient, ipfs: ipfsResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Organ Availability API
app.get('/api/organs', (req, res) => {
  res.json({ success: true, count: memoryStore.organs.length, data: memoryStore.organs });
});

app.post('/api/organs', async (req, res) => {
  try {
    const { donorId, organType, bloodGroup, hospitalName, donorAge } = req.body;
    const organId = `ORG-${Math.floor(1000 + Math.random() * 9000)}`;

    const donor = memoryStore.donors.find(d => d.donorId === donorId) || { name: 'Deceased Donor', age: donorAge || 35 };

    const newOrgan = {
      id: organId,
      organId,
      donorId,
      donorName: donor.name,
      donorAge: Number(donor.age || donorAge || 35),
      organType,
      bloodGroup,
      harvestTimestamp: new Date().toISOString(),
      hospitalName: hospitalName || 'Metropolitan Medical Center',
      status: 'Available'
    };

    memoryStore.organs.push(newOrgan);

    await logAuditOnChain(
      'ORGAN_LISTED',
      organId,
      req.user?.walletAddress,
      '',
      `Organ ${organType} (${bloodGroup}) listed from Donor ${donorId}`
    );

    res.status(201).json({ success: true, data: newOrgan });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Weighted Matching Engine API
app.post('/api/match/calculate', (req, res) => {
  try {
    const { organId } = req.body;

    let targetOrgan = memoryStore.organs.find(o => o.organId === organId || o.id === organId);
    if (!targetOrgan && memoryStore.organs.length > 0) {
      targetOrgan = memoryStore.organs[0];
    }

    if (!targetOrgan) {
      return res.status(404).json({ success: false, error: 'No organs available for matching' });
    }

    const donor = memoryStore.donors.find(d => d.donorId === targetOrgan.donorId) || {
      bloodGroup: targetOrgan.bloodGroup,
      age: targetOrgan.donorAge || 35,
      name: targetOrgan.donorName || 'Donor'
    };

    const eligibleRecipients = memoryStore.recipients.filter(r => !r.isMatched);
    const result = rankRecipientsForOrgan(targetOrgan, donor, eligibleRecipients);

    res.json({
      success: true,
      organ: targetOrgan,
      donor,
      totalEvaluated: eligibleRecipients.length,
      compatibleMatchesCount: result.compatibleMatches.length,
      incompatibleMatchesCount: result.incompatibleMatches.length,
      matches: result.compatibleMatches,
      incompatibleMatches: result.incompatibleMatches,
      allEvaluations: result.allEvaluations
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Record Match and broadcast to Blockchain
app.post('/api/match/record', async (req, res) => {
  try {
    const { organId, recipientId, totalScore, breakdown } = req.body;
    const matchId = `MTH-${Math.floor(10000 + Math.random() * 90000)}`;

    const organ = memoryStore.organs.find(o => o.organId === organId);
    const recipient = memoryStore.recipients.find(r => r.recipientId === recipientId);

    if (!organ || !recipient) {
      return res.status(404).json({ success: false, error: 'Organ or Recipient not found' });
    }

    const matchRecord = {
      id: matchId,
      matchId,
      organId: organ.organId,
      organType: organ.organType,
      donorId: organ.donorId,
      donorName: organ.donorName,
      recipientId: recipient.recipientId,
      recipientName: recipient.name,
      totalScore,
      breakdown,
      status: 'Pending', // Pending -> DoctorApproved -> HospitalApproved -> Completed
      doctorApproved: false,
      doctorNotes: '',
      doctorApprovedAt: null,
      hospitalCleared: false,
      hospitalNotes: '',
      hospitalClearedAt: null,
      createdAt: new Date().toISOString()
    };

    memoryStore.matches.push(matchRecord);
    organ.status = 'Matched';

    await logAuditOnChain(
      'MATCH_GENERATED',
      matchId,
      req.user?.walletAddress,
      '',
      `Match ${matchId} calculated for Organ ${organ.organId} & Recipient ${recipient.recipientId} (Score: ${totalScore}%)`
    );

    res.status(201).json({ success: true, data: matchRecord });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/matches', (req, res) => {
  res.json({ success: true, count: memoryStore.matches.length, data: memoryStore.matches });
});

// 5. Dual-Approval Clearance Workflow
// Doctor Approval
app.post('/api/approvals/doctor', async (req, res) => {
  try {
    const { matchId, doctorNotes, doctorAddress } = req.body;
    const match = memoryStore.matches.find(m => m.matchId === matchId || m.id === matchId);

    if (!match) return res.status(404).json({ success: false, error: 'Match record not found' });

    match.status = 'DoctorApproved';
    match.doctorApproved = true;
    match.doctorNotes = doctorNotes || 'Verified medical compatibility and lab reports';
    match.doctorAddress = doctorAddress || req.user?.walletAddress || '0x8626f69A7373073758299836439446777AD2D2b1';
    match.doctorApprovedAt = new Date().toISOString();

    await logAuditOnChain(
      'DOCTOR_APPROVED',
      match.matchId,
      match.doctorAddress,
      '',
      `Doctor approved match ${match.matchId}. Notes: ${match.doctorNotes}`
    );

    res.json({ success: true, message: 'Doctor sign-off submitted successfully', data: match });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Hospital Approval & Clearance
app.post('/api/approvals/hospital', async (req, res) => {
  try {
    const { matchId, hospitalNotes, hospitalAddress } = req.body;
    const match = memoryStore.matches.find(m => m.matchId === matchId || m.id === matchId);

    if (!match) return res.status(404).json({ success: false, error: 'Match record not found' });
    if (!match.doctorApproved) {
      return res.status(400).json({ success: false, error: 'Doctor approval required before hospital clearance' });
    }

    match.status = 'Completed';
    match.hospitalCleared = true;
    match.hospitalNotes = hospitalNotes || 'Transplant procedure cleared and logistics assigned';
    match.hospitalAddress = hospitalAddress || req.user?.walletAddress || '0xcd3B766CCDd6AE721141F452C550Ca635964ce34';
    match.hospitalClearedAt = new Date().toISOString();
    match.completedAt = new Date().toISOString();

    // Mark organ and recipient as transplanted/matched
    const organ = memoryStore.organs.find(o => o.organId === match.organId);
    const recipient = memoryStore.recipients.find(r => r.recipientId === match.recipientId);

    if (organ) organ.status = 'Transplanted';
    if (recipient) recipient.isMatched = true;

    await logAuditOnChain(
      'HOSPITAL_CLEARED',
      match.matchId,
      match.hospitalAddress,
      '',
      `Hospital cleared transplant for match ${match.matchId}. Notes: ${match.hospitalNotes}`
    );

    await logAuditOnChain(
      'TRANSPLANT_COMPLETED',
      match.matchId,
      match.hospitalAddress,
      recipient?.medicalReportIpfsHash || '',
      `Final transplant transaction written to blockchain ledger for Donor ${match.donorId} & Recipient ${match.recipientId}`
    );

    res.json({ success: true, message: 'Transplant cleared and written to blockchain ledger!', data: match });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Blockchain Audit Log Explorer API
app.get('/api/audit', async (req, res) => {
  try {
    const auditLogs = await getAuditTrail();
    res.json({ success: true, count: auditLogs.length, data: auditLogs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. IPFS Fetch Gateway API
app.get('/api/ipfs/:cid', async (req, res) => {
  try {
    const data = await getFromIpfs(req.params.cid);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: 'IPFS content not found' });
  }
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Organ Matcher Decentralized API Server running on port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(` Audit Feed:   http://localhost:${PORT}/api/audit`);
  console.log(`=======================================================`);
});
