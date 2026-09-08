const { memoryStore } = require('../config/db');

function initializeSeedData() {
  if (memoryStore.donors.length > 0) return;

  const sampleDonors = [
    {
      id: 'DNR-1001',
      donorId: 'DNR-1001',
      name: 'Eleanor Vance',
      age: 28,
      bloodGroup: 'O+',
      contact: 'eleanor.vance@example.com',
      organPledged: ['Kidney', 'Cornea', 'Liver'],
      consentStatus: 'Active',
      consentIpfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      registeredAt: new Date(Date.now() - 15 * 86400000).toISOString()
    },
    {
      id: 'DNR-1002',
      donorId: 'DNR-1002',
      name: 'Marcus Brody',
      age: 42,
      bloodGroup: 'A+',
      contact: 'marcus.b@example.com',
      organPledged: ['Heart', 'Kidney', 'Lungs'],
      consentStatus: 'Active',
      consentIpfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
      walletAddress: '0x3C44CdD46a93c74263808690e0096c57199c0A14',
      registeredAt: new Date(Date.now() - 40 * 86400000).toISOString()
    },
    {
      id: 'DNR-1003',
      donorId: 'DNR-1003',
      name: 'Sophia Chen',
      age: 34,
      bloodGroup: 'B+',
      contact: 'sophia.chen@example.com',
      organPledged: ['Liver', 'Pancreas'],
      consentStatus: 'Active',
      consentIpfsHash: 'QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx',
      walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      registeredAt: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ];

  const sampleRecipients = [
    {
      id: 'RCP-2001',
      recipientId: 'RCP-2001',
      name: 'Jonathan Sterling',
      age: 31,
      bloodGroup: 'O+',
      organRequired: 'Kidney',
      urgencyLevel: 1, // Status 1A - Highest
      urgencyLabel: 'Status 1A (Critical)',
      hlaMarkers: 'A*02:01, B*07:02, DRB1*15:01',
      medicalReportIpfsHash: 'QmPZ9gcawA221BaGwtw272hsLtGfLwGfL29G9G112hHs12',
      hospitalName: 'St. Jude General Hospital',
      doctorName: 'Dr. Sarah Jenkins',
      registerTimestamp: new Date(Date.now() - 180 * 86400000).toISOString(),
      isMatched: false
    },
    {
      id: 'RCP-2002',
      recipientId: 'RCP-2002',
      name: 'Amara Okafor',
      age: 45,
      bloodGroup: 'A+',
      organRequired: 'Heart',
      urgencyLevel: 1,
      urgencyLabel: 'Status 1A (Critical)',
      hlaMarkers: 'A*01:01, B*08:01, DRB1*03:01',
      medicalReportIpfsHash: 'QmQ2j38hsF991kL28xH189Kms921hGs9812Gsh912Bs912',
      hospitalName: 'Metropolitan Transplant Center',
      doctorName: 'Dr. Robert Vance',
      registerTimestamp: new Date(Date.now() - 240 * 86400000).toISOString(),
      isMatched: false
    },
    {
      id: 'RCP-2003',
      recipientId: 'RCP-2003',
      name: 'Carlos Mendez',
      age: 38,
      bloodGroup: 'B+',
      organRequired: 'Liver',
      urgencyLevel: 2,
      urgencyLabel: 'Status 1B (Urgent)',
      hlaMarkers: 'A*24:02, B*35:01, DRB1*04:01',
      medicalReportIpfsHash: 'QmR88sH712gBs9812hJS8192hSh291hJs9812hSa912Bs1',
      hospitalName: 'Apex Health Memorial',
      doctorName: 'Dr. Elena Rostova',
      registerTimestamp: new Date(Date.now() - 90 * 86400000).toISOString(),
      isMatched: false
    },
    {
      id: 'RCP-2004',
      recipientId: 'RCP-2004',
      name: 'David Hayes',
      age: 29,
      bloodGroup: 'O+',
      organRequired: 'Kidney',
      urgencyLevel: 2,
      urgencyLabel: 'Status 1B (Urgent)',
      hlaMarkers: 'A*02:01, B*44:02, DRB1*07:01',
      medicalReportIpfsHash: 'QmS99tK712hBs9812hJS8192hSh291hJs9812hSa912Bs2',
      hospitalName: 'St. Jude General Hospital',
      doctorName: 'Dr. Sarah Jenkins',
      registerTimestamp: new Date(Date.now() - 45 * 86400000).toISOString(),
      isMatched: false
    }
  ];

  const sampleOrgans = [
    {
      id: 'ORG-3001',
      organId: 'ORG-3001',
      donorId: 'DNR-1001',
      donorName: 'Eleanor Vance',
      donorAge: 28,
      organType: 'Kidney',
      bloodGroup: 'O+',
      harvestTimestamp: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
      hospitalName: 'St. Jude General Hospital',
      status: 'Available'
    },
    {
      id: 'ORG-3002',
      organId: 'ORG-3002',
      donorId: 'DNR-1002',
      donorName: 'Marcus Brody',
      donorAge: 42,
      organType: 'Heart',
      bloodGroup: 'A+',
      harvestTimestamp: new Date(Date.now() - 1.5 * 3600000).toISOString(), // 1.5 hours ago
      hospitalName: 'Metropolitan Transplant Center',
      status: 'Available'
    },
    {
      id: 'ORG-3003',
      organId: 'ORG-3003',
      donorId: 'DNR-1003',
      donorName: 'Sophia Chen',
      donorAge: 34,
      organType: 'Liver',
      bloodGroup: 'B+',
      harvestTimestamp: new Date(Date.now() - 3.5 * 3600000).toISOString(), // 3.5 hours ago
      hospitalName: 'Apex Health Memorial',
      status: 'Available'
    }
  ];

  memoryStore.donors.push(...sampleDonors);
  memoryStore.recipients.push(...sampleRecipients);
  memoryStore.organs.push(...sampleOrgans);

  console.log('[Seed] Sample Donors, Recipients, and Organs initialized in memory store.');
}

module.exports = { initializeSeedData };
