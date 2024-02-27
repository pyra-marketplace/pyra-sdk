import { BigNumberish, Signer, ethers } from "ethers";
import { Connector } from "@meteor-web3/connector";

import { DataAssetBase } from "@pyra-marketplace/assets-sdk/data-asset";
import { ChainId } from "./types";
import { PyraMarket__factory } from "./abi/typechain";
import { DEPLOYED_ADDRESSES } from "./addresses";

export class PyraMarket extends DataAssetBase {
  pyraMarket;
  chainId?: ChainId;
  connector: Connector;
  signer?: Signer;

  constructor({
    chainId,
    connector
  }: {
    chainId?: ChainId;
    connector: Connector;
  }) {
    super({
      chainId,
      connector
    });
    const provider = connector.getProvider();
    const ethersProvider = new ethers.providers.Web3Provider(provider, "any");
    this.signer = ethersProvider.getSigner();
    this.chainId = chainId;
    this.connector = connector;

    this.pyraMarket = PyraMarket__factory.connect(
      DEPLOYED_ADDRESSES[chainId!]?.PyraMarket,
      this.signer
    );
  }

  public async createShare({
    shareName,
    shareSymbol,
    feePoint
  }: {
    shareName: string;
    shareSymbol: string;
    feePoint: BigNumberish;
  }) {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const tx = await this.pyraMarket.createShare(
      shareName,
      shareSymbol,
      feePoint
    );
    const receipt = await tx.wait();
    const targetEvents = receipt.events?.filter(
      (e: any) => e.event === "ShareCreated"
    );
    if (!targetEvents || targetEvents.length === 0 || !targetEvents[0].args) {
      throw new Error("Filter ShareCreated event failed");
    }
    const shareContractAddress: string = targetEvents[0].args[1];
    const revenuePoolContractAddress: string = targetEvents[0].args[2];
    return { shareContractAddress, revenuePoolContractAddress };
  }

  public async buyShares({
    creator,
    amount
  }: {
    creator: string;
    amount: BigNumberish;
  }) {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const totalPrice = await this.pyraMarket.getBuyPriceAfterFee(
      creator,
      amount
    );
    const tx = await this.pyraMarket.buyShares(creator, amount, {
      value: totalPrice
    });
    await tx.wait();
  }

  public async sellShares({
    creator,
    amount
  }: {
    creator: string;
    amount: BigNumberish;
  }) {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const tx = await this.pyraMarket.sellShares(creator, amount);
    await tx.wait();
  }

  public async getShareInfo(creator: string) {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const shareInfo = await this.pyraMarket.getShareInfo(creator);
    return shareInfo;
  }
}
