// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OrganDonationAudit
 * @dev Smart contract for Decentralized Organ Donor & Recipient Matcher.
 */
contract OrganDonationAudit {
    
    address public admin;

    enum ConsentStatus { Revoked, Active }
    enum OrganStatus { Available, Matched, Transplanted, Expired }
    enum MatchStatus { Pending, DoctorApproved, HospitalApproved, Completed, Rejected }

    struct Donor {
        string donorId;
        address donorAddress;
        string bloodGroup;
        uint256 age;
        string consentIpfsHash;
        ConsentStatus status;
        uint256 timestamp;
    }

    struct Recipient {
        string recipientId;
        address recipientAddress;
        string organRequired;
        string bloodGroup;
        uint256 age;
        string medicalReportIpfsHash;
        uint8 urgencyLevel;
        string hlaMarkers;
        uint256 registerTimestamp;
        bool isMatched;
    }

    struct OrganItem {
        string organId;
        string donorId;
        string organType;
        string bloodGroup;
        uint256 harvestTimestamp;
        OrganStatus status;
    }

    struct ScoreBreakdown {
        uint256 bloodGroupScore;
        uint256 organTypeScore;
        uint256 availabilityScore;
        uint256 ageDiffScore;
        uint256 hlaScore;
        uint256 urgencyScore;
        uint256 waitingTimeScore;
    }

    struct MatchRecord {
        string matchId;
        string organId;
        string donorId;
        string recipientId;
        uint256 totalScore;
        ScoreBreakdown breakdown;
        MatchStatus status;
        address doctorApprover;
        string doctorNotes;
        uint256 doctorApprovedTime;
        address hospitalApprover;
        string hospitalNotes;
        uint256 hospitalApprovedTime;
        uint256 createdTimestamp;
        uint256 completedTimestamp;
    }

    struct AuditEntry {
        uint256 entryId;
        string eventType;
        string referenceId;
        address triggeredBy;
        string ipfsHash;
        uint256 timestamp;
        string details;
    }

    mapping(string => Donor) public donors;
    mapping(string => Recipient) public recipients;
    mapping(string => OrganItem) public organs;
    mapping(string => MatchRecord) public matches;
    
    string[] public donorIds;
    string[] public recipientIds;
    string[] public organIds;
    string[] public matchIds;
    AuditEntry[] public auditTrail;

    mapping(address => bool) public authorizedDoctors;
    mapping(address => bool) public authorizedHospitals;

    event DonorRegistered(string indexed donorId, address indexed donorAddress, string consentIpfsHash, uint256 timestamp);
    event DonorConsentUpdated(string indexed donorId, ConsentStatus status, string newIpfsHash, uint256 timestamp);
    event RecipientRegistered(string indexed recipientId, string organRequired, string medicalReportIpfsHash, uint256 timestamp);
    event OrganListed(string indexed organId, string indexed donorId, string organType, uint256 harvestTimestamp);
    event MatchRecorded(string indexed matchId, string organId, string recipientId, uint256 totalScore, uint256 timestamp);
    event DoctorApprovalSigned(string indexed matchId, address indexed doctor, string notes, uint256 timestamp);
    event HospitalClearanceSigned(string indexed matchId, address indexed hospital, string notes, uint256 timestamp);
    event TransplantCompleted(string indexed matchId, string donorId, string recipientId, uint256 timestamp);
    event AuditLogCreated(uint256 indexed entryId, string eventType, string referenceId, address indexed triggeredBy, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyDoctor() {
        require(authorizedDoctors[msg.sender] || msg.sender == admin, "Not doctor");
        _;
    }

    modifier onlyHospital() {
        require(authorizedHospitals[msg.sender] || msg.sender == admin, "Not hospital");
        _;
    }

    constructor() {
        admin = msg.sender;
        authorizedDoctors[msg.sender] = true;
        authorizedHospitals[msg.sender] = true;
    }

    function setDoctorAuthorization(address doctor, bool status) external onlyAdmin {
        authorizedDoctors[doctor] = status;
    }

    function setHospitalAuthorization(address hospital, bool status) external onlyAdmin {
        authorizedHospitals[hospital] = status;
    }

    function registerDonor(
        string memory _donorId,
        string memory _bloodGroup,
        uint256 _age,
        string memory _consentIpfsHash
    ) external {
        require(bytes(donors[_donorId].donorId).length == 0, "Donor exists");

        donors[_donorId] = Donor({
            donorId: _donorId,
            donorAddress: msg.sender,
            bloodGroup: _bloodGroup,
            age: _age,
            consentIpfsHash: _consentIpfsHash,
            status: ConsentStatus.Active,
            timestamp: block.timestamp
        });

        donorIds.push(_donorId);

        _addAuditEntry("CONSENT_REGISTERED", _donorId, msg.sender, _consentIpfsHash, "Donor pledged consent");
        emit DonorRegistered(_donorId, msg.sender, _consentIpfsHash, block.timestamp);
    }

    function updateDonorConsent(string memory _donorId, ConsentStatus _status, string memory _newConsentIpfsHash) external {
        require(bytes(donors[_donorId].donorId).length != 0, "Donor missing");
        require(donors[_donorId].donorAddress == msg.sender || msg.sender == admin, "Unauthorized");

        donors[_donorId].status = _status;
        if (bytes(_newConsentIpfsHash).length > 0) {
            donors[_donorId].consentIpfsHash = _newConsentIpfsHash;
        }

        _addAuditEntry(
            _status == ConsentStatus.Active ? "CONSENT_UPDATED" : "CONSENT_REVOKED",
            _donorId,
            msg.sender,
            donors[_donorId].consentIpfsHash,
            _status == ConsentStatus.Active ? "Consent updated" : "Consent revoked"
        );

        emit DonorConsentUpdated(_donorId, _status, donors[_donorId].consentIpfsHash, block.timestamp);
    }

    function registerRecipient(
        string memory _recipientId,
        string memory _organRequired,
        string memory _bloodGroup,
        uint256 _age,
        string memory _medicalReportIpfsHash,
        uint8 _urgencyLevel,
        string memory _hlaMarkers
    ) external {
        require(bytes(recipients[_recipientId].recipientId).length == 0, "Recipient exists");

        recipients[_recipientId] = Recipient({
            recipientId: _recipientId,
            recipientAddress: msg.sender,
            organRequired: _organRequired,
            bloodGroup: _bloodGroup,
            age: _age,
            medicalReportIpfsHash: _medicalReportIpfsHash,
            urgencyLevel: _urgencyLevel,
            hlaMarkers: _hlaMarkers,
            registerTimestamp: block.timestamp,
            isMatched: false
        });

        recipientIds.push(_recipientId);

        _addAuditEntry("RECIPIENT_REGISTERED", _recipientId, msg.sender, _medicalReportIpfsHash, "Recipient registered");
        emit RecipientRegistered(_recipientId, _organRequired, _medicalReportIpfsHash, block.timestamp);
    }

    function listOrgan(
        string memory _organId,
        string memory _donorId,
        string memory _organType,
        string memory _bloodGroup,
        uint256 _harvestTimestamp
    ) external onlyHospital {
        require(bytes(donors[_donorId].donorId).length != 0, "Donor missing");

        organs[_organId] = OrganItem({
            organId: _organId,
            donorId: _donorId,
            organType: _organType,
            bloodGroup: _bloodGroup,
            harvestTimestamp: _harvestTimestamp > 0 ? _harvestTimestamp : block.timestamp,
            status: OrganStatus.Available
        });

        organIds.push(_organId);

        _addAuditEntry("ORGAN_LISTED", _organId, msg.sender, "", "Organ listed");
        emit OrganListed(_organId, _donorId, _organType, block.timestamp);
    }

    function recordMatch(
        string memory _matchId,
        string memory _organId,
        string memory _donorId,
        string memory _recipientId,
        uint256 _totalScore,
        uint256[7] memory _breakdownValues
    ) external onlyHospital {
        MatchRecord storage m = matches[_matchId];
        m.matchId = _matchId;
        m.organId = _organId;
        m.donorId = _donorId;
        m.recipientId = _recipientId;
        m.totalScore = _totalScore;
        m.breakdown = ScoreBreakdown({
            bloodGroupScore: _breakdownValues[0],
            organTypeScore: _breakdownValues[1],
            availabilityScore: _breakdownValues[2],
            ageDiffScore: _breakdownValues[3],
            hlaScore: _breakdownValues[4],
            urgencyScore: _breakdownValues[5],
            waitingTimeScore: _breakdownValues[6]
        });
        m.status = MatchStatus.Pending;
        m.createdTimestamp = block.timestamp;

        matchIds.push(_matchId);
        organs[_organId].status = OrganStatus.Matched;

        _addAuditEntry("MATCH_GENERATED", _matchId, msg.sender, "", "Match generated");
        emit MatchRecorded(_matchId, _organId, _recipientId, _totalScore, block.timestamp);
    }

    function approveByDoctor(string memory _matchId, string memory _notes) external onlyDoctor {
        MatchRecord storage m = matches[_matchId];
        require(bytes(m.matchId).length != 0, "Match missing");
        require(m.status == MatchStatus.Pending, "Not pending");

        m.status = MatchStatus.DoctorApproved;
        m.doctorApprover = msg.sender;
        m.doctorNotes = _notes;
        m.doctorApprovedTime = block.timestamp;

        _addAuditEntry("DOCTOR_APPROVED", _matchId, msg.sender, "", _notes);
        emit DoctorApprovalSigned(_matchId, msg.sender, _notes, block.timestamp);
    }

    function approveByHospitalAndClear(string memory _matchId, string memory _notes) external onlyHospital {
        MatchRecord storage m = matches[_matchId];
        require(bytes(m.matchId).length != 0, "Match missing");
        require(m.status == MatchStatus.DoctorApproved, "Doctor approval required");

        m.status = MatchStatus.Completed;
        m.hospitalApprover = msg.sender;
        m.hospitalNotes = _notes;
        m.hospitalApprovedTime = block.timestamp;
        m.completedTimestamp = block.timestamp;

        organs[m.organId].status = OrganStatus.Transplanted;
        recipients[m.recipientId].isMatched = true;

        _addAuditEntry("HOSPITAL_CLEARED", _matchId, msg.sender, "", _notes);
        _addAuditEntry("TRANSPLANT_COMPLETED", _matchId, msg.sender, "", "Transplant procedure finalized");

        emit HospitalClearanceSigned(_matchId, msg.sender, _notes, block.timestamp);
        emit TransplantCompleted(_matchId, m.donorId, m.recipientId, block.timestamp);
    }

    function _addAuditEntry(
        string memory _eventType,
        string memory _referenceId,
        address _triggeredBy,
        string memory _ipfsHash,
        string memory _details
    ) internal {
        uint256 nextId = auditTrail.length + 1;
        auditTrail.push(AuditEntry({
            entryId: nextId,
            eventType: _eventType,
            referenceId: _referenceId,
            triggeredBy: _triggeredBy,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            details: _details
        }));

        emit AuditLogCreated(nextId, _eventType, _referenceId, _triggeredBy, block.timestamp);
    }

    function getAuditTrailCount() external view returns (uint256) {
        return auditTrail.length;
    }

    function getAuditTrail(uint256 limit) external view returns (AuditEntry[] memory) {
        uint256 total = auditTrail.length;
        if (limit == 0 || limit > total) limit = total;
        AuditEntry[] memory result = new AuditEntry[](limit);
        for (uint256 i = 0; i < limit; i++) {
            result[i] = auditTrail[total - 1 - i];
        }
        return result;
    }
}
