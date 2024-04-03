/* eslint-disable no-empty */
import { BigNumber, BigNumberish, Signer, ethers } from "ethers";
import { Connector } from "@meteor-web3/connector";

import { ChainId, RevenuePoolActivityRes, StakeStatus } from "./types";
import { Share__factory, RevenuePool__factory } from "./abi/typechain";
import { retryRPC } from "./utils/retryRPC";
import { switchNetwork } from "./utils/network";
import { RPC } from "./configs";
import { http } from "./utils";

export class RevenuePool {
  share;
  revenuePool;
  shareAddress?: string;
  revenuePoolAddress: string;
  chainId?: ChainId;
  connector: Connector;
  signer?: Signer;

  constructor({
    chainId,
    shareAddress,
    revenuePoolAddress,
    connector
  }: {
    chainId?: ChainId;
    shareAddress?: string;
    revenuePoolAddress: string;
    connector: Connector;
  }) {
    this.shareAddress = shareAddress;
    this.revenuePoolAddress = revenuePoolAddress;
    this.chainId = chainId;
    this.connector = connector;
    try {
      const provider = connector.getProvider();
      const ethersProvider = new ethers.providers.Web3Provider(provider, "any");
      this.signer = ethersProvider.getSigner();
    } catch (error) {}

    if (shareAddress) {
      try {
        this.share = Share__factory.connect(shareAddress, this.signer!);
      } catch (error) {
        const rpcList = RPC[chainId as keyof typeof RPC];
        const provider = new ethers.providers.JsonRpcProvider(rpcList[0]);
        this.share = Share__factory.connect(shareAddress, provider);
      }
    }

    try {
      this.revenuePool = RevenuePool__factory.connect(
        revenuePoolAddress,
        this.signer!
      );
    } catch (error) {
      const rpcList = RPC[chainId as keyof typeof RPC];
      const provider = new ethers.providers.JsonRpcProvider(rpcList[0]);
      this.revenuePool = RevenuePool__factory.connect(
        this.revenuePoolAddress,
        provider
      );
    }
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

    await switchNetwork({ connector: this.connector, chainId: this.chainId });

    let tx = await this.share.approve(this.revenuePoolAddress, sharesAmount);
    await tx.wait();

    tx = await this.revenuePool.stake(sharesAmount);
    await tx.wait();
  }

  public async unstake(sharesAmount: BigNumberish) {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await switchNetwork({ connector: this.connector, chainId: this.chainId });

    const tx = await this.revenuePool.unstake(sharesAmount);
    await tx.wait();
  }

  public async claim() {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await switchNetwork({ connector: this.connector, chainId: this.chainId });

    const tx = await this.revenuePool.claim();
    const receipt = await tx.wait();

    const targetEvents = receipt.events?.filter(
      (e: any) => e.event === "RevenueClaimed"
    );
    if (!targetEvents || targetEvents.length === 0 || !targetEvents[0].args) {
      throw new Error("Filter RevenueClaimed event failed");
    }
    const revenue: BigNumber = targetEvents[0].args[3];
    return revenue;
  }

  public async loadStakeStatus() {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    if (!this.revenuePoolAddress) {
      throw new Error(
        "RevenuePoolAddress cannot be empty, please pass in through constructor"
      );
    }

    const stakeStatus: StakeStatus = await retryRPC({
      chainId: this.chainId,
      contractFactory: "revenuePool__factory",
      contractAddress: this.revenuePoolAddress,
      method: "getStakeStatus",
      params: [this.connector.address]
    });

    return stakeStatus;
  }

  public async loadClaimableRevenue() {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    if (!this.revenuePoolAddress) {
      throw new Error(
        "RevenuePoolAddress cannot be empty, please pass in through constructor"
      );
    }

    const revenue: BigNumber = await retryRPC({
      chainId: this.chainId,
      contractFactory: "revenuePool__factory",
      contractAddress: this.revenuePoolAddress,
      method: "getClaimableRevenue",
      params: [this.connector.address]
    });

    return revenue;
  }

  public async loadRevenuePoolBalance() {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    const balance: BigNumber = await retryRPC({
      chainId: this.chainId,
      method: "getBalance",
      params: [this.revenuePoolAddress]
    });

    return balance;
  }

  static async loadRevenuePoolActivities({
    chainId,
    type,
    revenuePool,
    shareholder,
    page,
    pageSize,
    orderBy,
    orderType
  }: {
    chainId?: number;
    type?: "Stake" | "Unstake" | "Claim";
    revenuePool?: string;
    shareholder?: string;
    page?: number;
    pageSize?: number;
    orderBy?: "block_number";
    orderType?: "asc" | "desc";
  }) {
    const revenuePoolActivities: RevenuePoolActivityRes[] = (
      await http.request({
        url: "pyra-marketplace/pyra-market/revenue-pool/activity",
        method: "get",
        params: {
          chain_id: chainId,
          type,
          revenue_pool: revenuePool,
          shareholder,
          page,
          page_size: pageSize,
          order_by: orderBy,
          order_type: orderType
        }
      })
    ).data;
    return revenuePoolActivities;
  }
}
