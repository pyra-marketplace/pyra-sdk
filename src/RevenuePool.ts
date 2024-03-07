import { BigNumberish, Signer, ethers } from "ethers";
import { Connector } from "@meteor-web3/connector";

import { ChainId } from "./types";
import { Share__factory, RevenuePool__factory } from "./abi/typechain";

export class RevenuePool {
  share;
  revenuePool;
  shareContractAddress?: string;
  revenuePoolContractAddress: string;
  chainId?: ChainId;
  connector: Connector;
  signer?: Signer;

  constructor({
    chainId,
    shareContractAddress,
    revenuePoolContractAddress,
    connector
  }: {
    chainId?: ChainId;
    shareContractAddress?: string;
    revenuePoolContractAddress: string;
    connector: Connector;
  }) {
    this.shareContractAddress = shareContractAddress;
    this.revenuePoolContractAddress = revenuePoolContractAddress;
    const provider = connector.getProvider();
    const ethersProvider = new ethers.providers.Web3Provider(provider, "any");
    this.signer = ethersProvider.getSigner();
    this.chainId = chainId;
    this.connector = connector;
    if (shareContractAddress) {
      this.share = Share__factory.connect(shareContractAddress, this.signer);
    }
    this.revenuePool = RevenuePool__factory.connect(
      revenuePoolContractAddress,
      this.signer
    );
  }

  public async stake(sharesAmount: BigNumberish) {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    if (!this.share) {
      throw new Error("Share contract address cannot be empty");
    }

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    let tx = await this.share.approve(
      this.revenuePoolContractAddress,
      sharesAmount
    );
    await tx.wait();

    tx = await this.revenuePool.stake(sharesAmount);
    await tx.wait();
  }

  public async unStake(sharesAmount: BigNumberish) {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const tx = await this.revenuePool.unstake(sharesAmount);
    await tx.wait();
  }

  public async claim() {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const tx = await this.revenuePool.claim(this.connector.address);
    const receipt = await tx.wait();

    const targetEvents = receipt.events?.filter(
      (e: any) => e.event === "Claimed"
    );
    if (!targetEvents || targetEvents.length === 0 || !targetEvents[0].args) {
      throw new Error("Filter Claimed event failed");
    }
    const rewards = targetEvents[0].args[1];
    return rewards;
  }

  public async getStakingRewards() {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const rewards = await this.revenuePool.getStakingRewards(
      this.connector.address
    );

    return rewards;
  }

  public async distribute(rewards: BigNumberish) {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const shareholder = await this.signer!.getAddress();

    const tx = await this.revenuePool.distribute(shareholder, rewards);
    const receipt = await tx.wait();

    const targetEvents = receipt.events?.filter(
      (e: any) => e.event === "Distributed"
    );
    if (!targetEvents || targetEvents.length === 0 || !targetEvents[0].args) {
      throw new Error("Filter Distributed event failed");
    }
    const revenue = targetEvents[0].args[1];
    return revenue;
  }

  public async getRevenuePoolBalance() {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    if (!this.signer) {
      throw new Error("Signer not found, please collect wallet");
    }

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const provider = this.signer.provider!;
    const balance = await provider.getBalance(this.revenuePoolContractAddress);

    return balance;
  }

  public async getTotalSupply() {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const totalSupply = await this.revenuePool.totalSupply();

    return totalSupply;
  }

  public async calculateRevenue() {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    if (!this.signer) {
      throw new Error("Signer not found, please collect wallet");
    }

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const stakingRewards = await this.getStakingRewards();

    const totalSupply = await this.getTotalSupply();

    const provider = this.signer.provider!;
    const balance = await provider.getBalance(this.revenuePoolContractAddress);

    return stakingRewards.div(totalSupply).mul(balance);
  }
}
