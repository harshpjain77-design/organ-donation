import { ethers } from 'ethers';
import contractArtifact from '../config/contractArtifact.json';

export async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask or Web3 wallet is not installed in your browser');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    return {
      connected: true,
      address,
      chainId: network.chainId.toString(),
      provider,
      signer
    };
  } catch (err) {
    console.error('Wallet connect error:', err);
    throw new Error(err.message || 'Failed to connect MetaMask wallet');
  }
}

export function getContract(signerOrProvider) {
  if (!contractArtifact || !contractArtifact.address) {
    console.warn('Contract artifact missing address. Contract may not be deployed yet.');
    return null;
  }
  return new ethers.Contract(contractArtifact.address, contractArtifact.abi, signerOrProvider);
}
