/**
 * Weighted Matching Engine for Organ Donor & Recipient Compatibility
 * Implements strict specification parameters:
 * 1. Blood Group (25%) - Compatibility Matrix (O, A, B, AB)
 * 2. Organ Type (20%) - Must match donor organ to recipient need
 * 3. Organ Availability (15%) - Time elapsed since organ harvest
 * 4. Age Difference (10%) - Penalizes large age gaps
 * 5. HLA Compatibility (10%) - Simplified 6-locus tissue matching
 * 6. Medical Urgency (10%) - Priority to higher urgency levels (Status 1A to Routine)
 * 7. Waiting Time (10%) - Priority for duration on waiting list
 */

// Universal Blood Compatibility Rules (Donor -> Allowed Recipients)
const BLOOD_COMPATIBILITY = {
  'O-': ['O-', 'O+', 'O', 'A-', 'A+', 'A', 'B-', 'B+', 'B', 'AB-', 'AB+', 'AB'],
  'O+': ['O+', 'O', 'A+', 'A', 'B+', 'B', 'AB+', 'AB'],
  'O':  ['O-', 'O+', 'O', 'A-', 'A+', 'A', 'B-', 'B+', 'B', 'AB-', 'AB+', 'AB'],
  'A-': ['A-', 'A+', 'A', 'AB-', 'AB+', 'AB'],
  'A+': ['A+', 'A', 'AB+', 'AB'],
  'A':  ['A-', 'A+', 'A', 'AB-', 'AB+', 'AB'],
  'B-': ['B-', 'B+', 'B', 'AB-', 'AB+', 'AB'],
  'B+': ['B+', 'B', 'AB+', 'AB'],
  'B':  ['B-', 'B+', 'B', 'AB-', 'AB+', 'AB'],
  'AB-': ['AB-', 'AB+', 'AB'],
  'AB+': ['AB+', 'AB'],
  'AB': ['AB-', 'AB+', 'AB']
};

const MAX_COLD_ISCHEMIA_HOURS = {
  Heart: 6,
  Lungs: 6,
  Liver: 12,
  Pancreas: 12,
  Kidney: 30,
  Cornea: 72,
  Default: 24
};

function normalizeBloodType(bg) {
  if (!bg) return 'O';
  return bg.trim().toUpperCase();
}

/**
 * Calculates compatibility score between an Organ/Donor and a Recipient.
 */
function calculateCompatibility(organ, donor, recipient) {
  const donorBlood = normalizeBloodType(donor.bloodGroup || organ.bloodGroup);
  const recipientBlood = normalizeBloodType(recipient.bloodGroup);
  const organType = (organ.organType || organ.organRequired || '').trim().toLowerCase();
  const recipientNeed = (recipient.organRequired || recipient.organType || '').trim().toLowerCase();

  let isCompatible = true;
  let incompatibleReasons = [];

  // 1. Organ Type Match (Weight: 20%)
  let organTypeScore = 0;
  if (organType && recipientNeed && organType === recipientNeed) {
    organTypeScore = 20;
  } else {
    isCompatible = false;
    incompatibleReasons.push(`Organ Mismatch: Donor has ${organ.organType}, Recipient needs ${recipient.organRequired}`);
  }

  // 2. Blood Group Compatibility (Weight: 25%)
  let bloodGroupScore = 0;
  const allowedRecipients = BLOOD_COMPATIBILITY[donorBlood] || [donorBlood];

  // Base ABO matching fallback if exact string matching differs
  const donorABO = donorBlood.replace(/[^ABO]/g, '');
  const recipABO = recipientBlood.replace(/[^ABO]/g, '');

  const isBloodAllowed = allowedRecipients.includes(recipientBlood) || donorABO === 'O' || donorABO === recipABO;

  if (isBloodAllowed) {
    if (donorBlood === recipientBlood || donorABO === recipABO) {
      bloodGroupScore = 25; // Exact match
    } else {
      bloodGroupScore = 22.5; // Compatible non-exact match (e.g., O donor -> A recipient)
    }
  } else {
    isCompatible = false;
    incompatibleReasons.push(`Blood Incompatibility: Donor is ${donorBlood}, Recipient is ${recipientBlood}`);
  }

  // 3. Organ Availability / Freshness Time (Weight: 15%)
  let availabilityScore = 15;
  const harvestTime = new Date(organ.harvestTimestamp || organ.createdAt || Date.now()).getTime();
  const hoursSinceHarvest = Math.max(0, (Date.now() - harvestTime) / (1000 * 3600));
  const maxHours = MAX_COLD_ISCHEMIA_HOURS[organ.organType] || MAX_COLD_ISCHEMIA_HOURS.Default;

  if (hoursSinceHarvest >= maxHours) {
    availabilityScore = 0;
    // Cold ischemia exceeded but don't mark hard incompatible unless expired > 48h
    if (hoursSinceHarvest > maxHours * 2) {
      isCompatible = false;
      incompatibleReasons.push(`Cold Ischemia Expired: Organ harvested ${Math.round(hoursSinceHarvest)}h ago`);
    }
  } else {
    availabilityScore = Math.max(3, 15 * (1 - (hoursSinceHarvest / maxHours) * 0.8));
  }

  // 4. Age Discrepancy (Weight: 10%)
  const donorAge = Number(donor.age || organ.donorAge || 35);
  const recipientAge = Number(recipient.age || 35);
  const ageDelta = Math.abs(donorAge - recipientAge);

  let ageDiffScore = 10;
  if (ageDelta <= 5) ageDiffScore = 10;
  else if (ageDelta <= 15) ageDiffScore = 8.5;
  else if (ageDelta <= 25) ageDiffScore = 6.5;
  else if (ageDelta <= 40) ageDiffScore = 4.0;
  else ageDiffScore = 2.0;

  // 5. HLA Tissue Compatibility (Weight: 10%)
  let hlaScore = 5;
  const donorHla = parseHlaMarkers(donor.hlaMarkers || organ.hlaMarkers || "");
  const recipientHla = parseHlaMarkers(recipient.hlaMarkers || "");

  if (donorHla.length > 0 && recipientHla.length > 0) {
    let matchCount = 0;
    donorHla.forEach(marker => {
      if (recipientHla.includes(marker)) matchCount++;
    });
    const matchRatio = matchCount / Math.max(donorHla.length, 6);
    hlaScore = Math.min(10, Math.max(1, matchRatio * 10));
  }

  // 6. Medical Urgency (Weight: 10%)
  let urgencyScore = 2.5;
  const urgency = Number(recipient.urgencyLevel || recipient.urgency || 3);
  if (urgency === 1) urgencyScore = 10.0;
  else if (urgency === 2) urgencyScore = 7.5;
  else if (urgency === 3) urgencyScore = 5.0;
  else urgencyScore = 2.5;

  // 7. Waiting Time (Weight: 10%)
  const regTimestamp = new Date(recipient.registerTimestamp || recipient.createdAt || Date.now() - (30 * 86400000)).getTime();
  const daysWaiting = Math.max(0, (Date.now() - regTimestamp) / (1000 * 3600 * 24));
  let waitingTimeScore = Math.min(10, Math.max(1, (daysWaiting / 365) * 10));

  const totalRaw = bloodGroupScore + organTypeScore + availabilityScore + ageDiffScore + hlaScore + urgencyScore + waitingTimeScore;
  const totalScore = Math.round(totalRaw * 100) / 100;

  return {
    totalScore: isCompatible ? totalScore : 0,
    isCompatible,
    incompatibleReason: incompatibleReasons.join('; '),
    breakdown: {
      bloodGroupScore: Math.round(bloodGroupScore * 100) / 100,
      organTypeScore: Math.round(organTypeScore * 100) / 100,
      availabilityScore: Math.round(availabilityScore * 100) / 100,
      ageDiffScore: Math.round(ageDiffScore * 100) / 100,
      hlaScore: Math.round(hlaScore * 100) / 100,
      urgencyScore: Math.round(urgencyScore * 100) / 100,
      waitingTimeScore: Math.round(waitingTimeScore * 100) / 100
    }
  };
}

function parseHlaMarkers(hlaStr) {
  if (!hlaStr) return [];
  return hlaStr
    .split(/[,;\s]+/)
    .map(s => s.trim().toUpperCase())
    .filter(Boolean);
}

/**
 * Rank recipients for a given donor organ (Returns BOTH compatible & incompatible lists)
 */
function rankRecipientsForOrgan(organ, donor, recipientsList) {
  const evaluations = recipientsList.map(recipient => {
    const evaluation = calculateCompatibility(organ, donor, recipient);
    return {
      recipient,
      organ,
      donor,
      totalScore: evaluation.totalScore,
      isCompatible: evaluation.isCompatible,
      incompatibleReason: evaluation.incompatibleReason,
      breakdown: evaluation.breakdown
    };
  });

  const compatibleMatches = evaluations
    .filter(item => item.isCompatible)
    .sort((a, b) => b.totalScore - a.totalScore);

  const incompatibleMatches = evaluations
    .filter(item => !item.isCompatible);

  return {
    compatibleMatches,
    incompatibleMatches,
    allEvaluations: evaluations
  };
}

module.exports = {
  calculateCompatibility,
  rankRecipientsForOrgan,
  BLOOD_COMPATIBILITY,
  MAX_COLD_ISCHEMIA_HOURS
};
