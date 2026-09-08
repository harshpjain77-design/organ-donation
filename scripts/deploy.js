const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying OrganDonationAudit smart contract...");

  const OrganDonationAudit = await hre.ethers.getContractFactory("OrganDonationAudit");
  const contract = await OrganDonationAudit.deploy();

  await contract.waitForDeployment();

  const targetAddress = await contract.getAddress();
  console.log(`OrganDonationAudit deployed successfully to address: ${targetAddress}`);

  const artifact = await hre.artifacts.readArtifact("OrganDonationAudit");

  const exportData = {
    address: targetAddress,
    abi: artifact.abi
  };

  // Write to backend
  const backendConfigDir = path.join(__dirname, "../backend/src/config");
  if (!fs.existsSync(backendConfigDir)) {
    fs.mkdirSync(backendConfigDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(backendConfigDir, "contractArtifact.json"),
    JSON.stringify(exportData, null, 2)
  );

  // Write to frontend
  const frontendConfigDir = path.join(__dirname, "../frontend/src/config");
  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(frontendConfigDir, "contractArtifact.json"),
    JSON.stringify(exportData, null, 2)
  );

  console.log("Exported contract ABI and address to backend & frontend configuration!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
