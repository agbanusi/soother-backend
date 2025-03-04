import { Injectable } from '@nestjs/common';

// blockchain.service.ts
@Injectable()
export class BlockchainService {
  private providers: { [chainId: number]: ethers.providers.JsonRpcProvider } =
    {};
  private signers: { [chainId: number]: ethers.Wallet } = {};

  constructor() {
    this.initProviders();
  }

  private initProviders() {
    const chains = JSON.parse(process.env.SUPPORTED_CHAINS);
    chains.forEach((chain) => {
      this.providers[chain.id] = new ethers.providers.JsonRpcProvider(
        chain.rpc,
      );
      this.signers[chain.id] = new ethers.Wallet(
        process.env.DEPLOYER_PK,
        this.providers[chain.id],
      );
    });
  }

  getContract(address: string, abi: any, chainId = 1) {
    return new ethers.Contract(
      address,
      abi,
      this.signers[chainId] || this.providers[chainId],
    );
  }

  async deployContract(contractName: string, args: any[], chainId = 1) {
    const factory = await ethers.getContractFactory(
      contractName,
      this.signers[chainId],
    );
    return factory.deploy(...args);
  }
}
