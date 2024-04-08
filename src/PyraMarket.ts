import { BigNumberish, Signer, ethers } from "ethers";
import { Connector, SYSTEM_CALL } from "@meteor-web3/connector";

import {
  PublisherDailyRecordRes,
  PublisherProfileRes,
  PyraMarketRes,
  PyraMarketShareActivityRes,
  PyraMarketShareHolderPortfolioRes,
  PyraMarketShareHolderRes,
  ShareInfo,
  WatchlistRes
} from "./types";
import { PyraMarket__factory } from "./abi/typechain";
import { DEPLOYED_ADDRESSES, RPC } from "./configs";
import { http } from "./utils";
import { retryRPC } from "./utils/retryRPC";
import { switchNetwork } from "./utils/network";

export class PyraMarket {
  pyraMarket;
  pyraMarketAddress: string;
  chainId?: number;
  connector: Connector;
  signer?: Signer;

  constructor({
    chainId,
    connector
  }: {
    chainId?: number;
    connector: Connector;
  }) {
    this.pyraMarketAddress =
      DEPLOYED_ADDRESSES[chainId as keyof typeof DEPLOYED_ADDRESSES]
        ?.PyraMarket;

    this.chainId = chainId;
    this.connector = connector;
    try {
      const provider = connector.getProvider();
      const ethersProvider = new ethers.providers.Web3Provider(provider, "any");
      this.signer = ethersProvider.getSigner();
      this.pyraMarket = PyraMarket__factory.connect(
        this.pyraMarketAddress,
        this.signer
      );
    } catch (error) {
      const rpcList = RPC[chainId as keyof typeof RPC];
      const provider = new ethers.providers.JsonRpcProvider(rpcList[0]);
      this.pyraMarket = PyraMarket__factory.connect(
        this.pyraMarketAddress,
        provider
      );
    }
  }

  public async createShare({
    shareName,
    shareSymbol
  }: {
    shareName: string;
    shareSymbol: string;
  }) {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await switchNetwork({ connector: this.connector, chainId: this.chainId });

    const tx = await this.pyraMarket.createShare(shareName, shareSymbol);
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

  public async loadShareBalance({
    shareAddress,
    address
  }: {
    shareAddress: string;
    address: string;
  }) {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    const balance = await retryRPC({
      chainId: this.chainId,
      contractFactory: "share__factory",
      contractAddress: shareAddress,
      method: "balanceOf",
      params: [address]
    });
    return balance;
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

    const price = await retryRPC({
      chainId: this.chainId,
      contractFactory: "pyraMarket__factory",
      contractAddress: this.pyraMarketAddress,
      method: "getBuyPrice",
      params: [creator, amount]
    });

    return price;
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

    const price = await retryRPC({
      chainId: this.chainId,
      contractFactory: "pyraMarket__factory",
      contractAddress: this.pyraMarketAddress,
      method: "getSellPrice",
      params: [creator, amount]
    });

    return price;
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

  public async buyAndStakeShares({
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

    const tx = await this.pyraMarket.buyAndStakeShares(creator, amount, {
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

    await switchNetwork({ connector: this.connector, chainId: this.chainId });

    const tx = await this.pyraMarket.sellShares(creator, amount);

    await tx.wait();
  }

  public async unstakeAndSellShares({
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

    await switchNetwork({ connector: this.connector, chainId: this.chainId });

    const tx = await this.pyraMarket.unstakeAndSellShares(creator, amount);

    await tx.wait();
  }

  public async loadShareInfo(creator: string) {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    const shareInfo: ShareInfo = await retryRPC({
      chainId: this.chainId,
      contractFactory: "pyraMarket__factory",
      contractAddress: this.pyraMarketAddress,
      method: "getShareInfo",
      params: [creator]
    });
    return shareInfo;
  }

  public async loadTotalSupply(shareAddress: string) {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    const totalSupply = await retryRPC({
      chainId: this.chainId,
      contractFactory: "share__factory",
      contractAddress: shareAddress,
      method: "totalSupply",
      params: []
    });

    return totalSupply;
  }

  static async updatePublisherProfile({
    publisher,
    coverImageUrl,
    connector
  }: {
    publisher: string;
    coverImageUrl: string;
    connector: Connector;
  }) {
    const codeRes: any = await http.request({
      url: "code",
      method: "post"
    });
    const sigObj = await connector.runOS({
      method: SYSTEM_CALL.signWithSessionKey,
      params: {
        code: codeRes.code,
        requestPath: `/api/v1/pyra-marketplace/publisher/profile`
      }
    });
    const { siweMessage, jws } = sigObj;
    return http.request({
      url: "pyra-marketplace/publisher/profile",
      method: "post",
      params: {
        publisher,
        cover_image_url: coverImageUrl
      },
      headers: {
        Authorization: `Bearer ${(jws as any).signatures[0].protected}.${
          (jws as any).payload
        }.${(jws as any).signatures[0].signature}`,
        "x-pyra-siwe": btoa(JSON.stringify(siweMessage))
      }
    });
  }

  static async loadPublisherProfile(publisher: string) {
    const publisherProfile: PublisherProfileRes = (
      await http.request({
        url: "pyra-marketplace/publisher/profile",
        method: "get",
        params: {
          publisher
        }
      })
    ).data;
    return publisherProfile;
  }

  static async watch({
    watcher,
    publisher,
    connector
  }: {
    watcher: string;
    publisher: string;
    connector: Connector;
  }) {
    const codeRes: any = await http.request({
      url: "code",
      method: "post"
    });
    const sigObj = await connector.runOS({
      method: SYSTEM_CALL.signWithSessionKey,
      params: {
        code: codeRes.code,
        requestPath: `/api/v1/pyra-marketplace/watch-list/watch`
      }
    });
    const { siweMessage, jws } = sigObj;
    return http.request({
      url: "pyra-marketplace/watch-list/watch",
      method: "post",
      params: {
        watcher,
        publisher
      },
      headers: {
        Authorization: `Bearer ${(jws as any).signatures[0].protected}.${
          (jws as any).payload
        }.${(jws as any).signatures[0].signature}`,
        "x-pyra-siwe": btoa(JSON.stringify(siweMessage))
      }
    });
  }

  static async unwatch({
    watcher,
    publisher,
    connector
  }: {
    watcher: string;
    publisher: string;
    connector: Connector;
  }) {
    const codeRes: any = await http.request({
      url: "code",
      method: "post"
    });
    const sigObj = await connector.runOS({
      method: SYSTEM_CALL.signWithSessionKey,
      params: {
        code: codeRes.code,
        requestPath: `/api/v1/pyra-marketplace/watch-list/unwatch`
      }
    });
    const { siweMessage, jws } = sigObj;
    return http.request({
      url: "pyra-marketplace/watch-list/unwatch",
      method: "post",
      params: {
        watcher,
        publisher
      },
      headers: {
        Authorization: `Bearer ${(jws as any).signatures[0].protected}.${
          (jws as any).payload
        }.${(jws as any).signatures[0].signature}`,
        "x-pyra-siwe": btoa(JSON.stringify(siweMessage))
      }
    });
  }

  static async loadPyraMarkets({
    chainId,
    share,
    publisher,
    publishers,
    page,
    pageSize,
    orderBy,
    orderType
  }: {
    chainId?: number;
    share?: string;
    publisher?: string;
    publishers?: string[];
    page?: number;
    pageSize?: number;
    orderBy?:
      | "block_number"
      | "share_sales"
      | "total_value"
      | "total_volume"
      | "total_supply";
    orderType?: "asc" | "desc";
  }) {
    const pyraMarkets: PyraMarketRes[] = (
      await http.request({
        url: "pyra-marketplace/pyra-market",
        method: "get",
        params: {
          chain_id: chainId,
          share,
          publisher,
          publishers: publishers?.join(","),
          page,
          page_size: pageSize,
          order_by: orderBy,
          order_type: orderType
        }
      })
    ).data;
    return pyraMarkets;
  }

  static async loadTrendingPyraMarkets({
    chainId,
    days,
    page,
    pageSize
  }: {
    chainId?: number;
    days?: number;    // default=7 in backend
    page?: number;
    pageSize?: number;
  }) {
    const pyraMarkets: PyraMarketRes[] = (
      await http.request({
        url: "/pyra-marketplace/pyra-market/trending",
        method: "get",
        params: {
          chain_id: chainId,
          days,
          page,
          page_size: pageSize
        }
      })
    ).data;
    return pyraMarkets;
  }

  static async loadPyraMarketShareHolders({
    chainId,
    share,
    publisher,
    shareholder,
    page,
    pageSize,
    orderBy,
    orderType
  }: {
    chainId?: number;
    share?: string;
    publisher?: string;
    shareholder?: string;
    page?: number;
    pageSize?: number;
    orderBy?: "total_amount";
    orderType?: "asc" | "desc";
  }) {
    const shareHolders: PyraMarketShareHolderRes[] = (
      await http.request({
        url: "pyra-marketplace/pyra-market/share/holder",
        method: "get",
        params: {
          chain_id: chainId,
          share,
          publisher,
          shareholder,
          page,
          page_size: pageSize,
          order_by: orderBy,
          order_type: orderType
        }
      })
    ).data;
    return shareHolders;
  }

  static async loadPyraMarketShareHolderPortfolios({
    chainId,
    shareholder,
    orderBy,
    orderType
  }: {
    chainId?: number;
    shareholder?: string;
    orderBy?: "shares_price" | "update_at";
    orderType?: "asc" | "desc";
  }) {
    const shareHolderPortfolios: PyraMarketShareHolderPortfolioRes[] = (
      await http.request({
        url: "pyra-marketplace/pyra-market/share/holder/portfolio",
        method: "get",
        params: {
          chain_id: chainId,
          shareholder,
          order_by: orderBy,
          order_type: orderType
        }
      })
    ).data;
    return shareHolderPortfolios;
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
    const shareActivities: PyraMarketShareActivityRes[] = (
      await http.request({
        url: "pyra-marketplace/pyra-market/share/activity",
        method: "get",
        params: {
          chain_id: chainId,
          share,
          publisher,
          page,
          page_size: pageSize,
          order_by: orderBy,
          order_type: orderType
        }
      })
    ).data;
    return shareActivities;
  }

  static async loadPublisherDailyRecordChart({
    chainId,
    publisher,
    days
  }: {
    chainId: number;
    publisher: string;
    days: number;
  }) {
    const dailyRecords: PublisherDailyRecordRes[] = (
      await http.request({
        url: "/pyra-marketplace/publisher/daily-record/chart",
        method: "get",
        params: {
          chain_id: chainId,
          publisher,
          days
        }
      })
    ).data;
    return dailyRecords;
  }

  static async loadWatchlist({
    watcher,
    publisher,
    page,
    pageSize,
    orderBy,
    orderType
  }: {
    watcher?: string;
    publisher?: string;
    page?: number;
    pageSize?: number;
    orderBy?: "watch_at";
    orderType?: "asc" | "desc";
  }) {
    const watchlist: WatchlistRes[] = (
      await http.request({
        url: "pyra-marketplace/watch-list",
        method: "get",
        params: {
          watcher,
          publisher,
          page,
          page_size: pageSize,
          order_by: orderBy,
          order_type: orderType
        }
      })
    ).data;
    return watchlist;
  }
}
