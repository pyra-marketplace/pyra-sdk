import { BigNumberish, Signer, ethers } from "ethers";
import { Connector } from "@meteor-web3/connector";

import { DataAssetBase } from "@pyra-marketplace/assets-sdk/data-asset";
import {
  ChainId,
  PyraMarketRes,
  PyraMarketShareActivityRes,
  PyraMarketShareHolderRes
} from "./types";
import { PyraMarket__factory, Share__factory } from "./abi/typechain";
import { DEPLOYED_ADDRESSES } from "./addresses";
import { http } from "./utils";

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
    const shareAddress: string = targetEvents[0].args[1];
    const revenuePoolAddress: string = targetEvents[0].args[2];
    return { shareAddress, revenuePoolAddress };
  }

  public async loadBuyPrice({
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

    const totalPrice = await this.pyraMarket.getBuyPrice(creator, amount);

    return totalPrice;
  }

  public async loadSellPrice({
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

    const totalPrice = await this.pyraMarket.getSellPrice(creator, amount);

    return totalPrice;
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

  public async loadShareInfo(creator: string) {
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

    return {
      revenuePool: shareInfo.revenuePool,
      shareAddress: shareInfo.share,
      feePoint: shareInfo.feePoint,
      totalValue: shareInfo.totalValue
    };
  }

  public async loadTotalSupply(shareAddress: string) {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    if (!this.signer) {
      throw new Error("Signer not found, please connect wallet");
    }

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const share = Share__factory.connect(shareAddress, this.signer);

    const res = await share.totalSupply();

    return res;
  }

  static async loadPyraMarkets({
    chainId,
    publishers,
    page,
    pageSize,
    orderBy,
    orderType
  }: {
    chainId?: number;
    publishers: string[];
    page?: number;
    pageSize?: number;
    orderBy?: "block_number" | "share_sales" | "total_value" | "total_volume" | "total_supply";
    orderType?: "asc" | "desc";
  }) {
    const pyraMarkets: PyraMarketRes[] = await http.request({
      url: `${chainId || "*"}/pyra-marketplace/pyra-market`,
      method: "get",
      params: {
        publishers: publishers.join(","),
        page,
        page_size: pageSize,
        order_by: orderBy,
        order_type: orderType,
      }
    });
    return pyraMarkets;
  }

  static async loadPyraMarketShareHolders({
    chainId,
    share,
    publisher,
    page,
    pageSize,
    orderBy,
    orderType
  }: {
    chainId?: number;
    share?: string;
    publisher?: string;
    page?: number;
    pageSize?: number;
    orderBy?: "total_amount";
    orderType?: "asc" | "desc";
  }) {
    const shareHolders: PyraMarketShareHolderRes[] = await http.request({
      url: `${chainId || "*"}/pyra-marketplace/pyra-market/share/holder`,
      method: "get",
      params: {
        share,
        publisher,
        page,
        page_size: pageSize,
        order_by: orderBy,
        order_type: orderType,
      }
    });
    return shareHolders;
  }

  static async loadPyraMarketShareActivities({
    chainId,
    share,
    publisher,
    page,
    pageSize,
    orderBy,
    orderType
  }: {
    chainId?: number;
    share?: string;
    publisher?: string;
    page?: number;
    pageSize?: number;
    orderBy?: "block_number";
    orderType?: "asc" | "desc";
  }) {
    const shareActivities: PyraMarketShareActivityRes[] = await http.request({
      url: `${chainId || "*"}/pyra-marketplace/pyra-market/share/activity`,
      method: "get",
      params: {
        share,
        publisher,
        page,
        page_size: pageSize,
        order_by: orderBy,
        order_type: orderType,
      }
    });
    return shareActivities;
  }
}
