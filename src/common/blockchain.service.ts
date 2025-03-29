import { Injectable } from '@nestjs/common';
import { JsonRpcProvider, Contract, Wallet, ContractFactory } from 'ethers';

@Injectable()
export class BlockchainService {
  private providers: { [chainId: number]: JsonRpcProvider } = {};
  private signers: { [chainId: number]: Wallet } = {};

  constructor() {
    this.initProviders();
  }

  private initProviders() {
    const chains = JSON.parse(process.env.SUPPORTED_CHAINS || '[]');
    chains.forEach((chain) => {
      this.providers[chain.id] = new JsonRpcProvider(chain.rpc);
      if (process.env.DEPLOYER_PK) {
        this.signers[chain.id] = new Wallet(
          process.env.DEPLOYER_PK,
          this.providers[chain.id],
        );
      }
    });
  }

  getContract(address: string, abi: any, chainId = 1) {
    return new Contract(
      address,
      abi,
      this.signers[chainId] || this.providers[chainId],
    );
  }

  async deployContract(contractName: string, args: any[], chainId = 1) {
    if (!this.signers[chainId]) {
      throw new Error(`No signer available for chain ID ${chainId}`);
    }

    const factory = await this.getContractFactory(contractName, chainId);
    const contract = await factory.deploy(...args);

    // Wait for deployment to be confirmed
    await contract.deploymentTransaction().wait();

    return contract;
  }

  private async getContractFactory(contractName: string, chainId = 1) {
    // This is a simplified implementation
    // In a real-world scenario, you would need to fetch the ABI and bytecode
    const artifacts = require(`../../artifacts/${contractName}.json`);
    return new ContractFactory(
      artifacts.abi,
      artifacts.bytecode,
      this.signers[chainId],
    );
  }
}
