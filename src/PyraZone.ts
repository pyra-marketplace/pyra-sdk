import { BigNumber, BigNumberish } from "ethers";
import {
  Connector,
  SYSTEM_CALL,
  FileContent,
  SignalType,
  FolderType,
  Attached,
  DataAsset
} from "@meteor-web3/connector";

import {
  DataAssetBase,
  PublishParams
} from "@pyra-marketplace/assets-sdk/data-asset";
import {
  PyraZoneRes,
  PyraZoneTierkeyActivityRes,
  PyraZoneTierkeyHolderRes
} from "./types";
import { PyraZone__factory } from "./abi/typechain";
import { DEPLOYED_ADDRESSES } from "./configs";
import { TradeType } from "./types";
import { http } from "./utils";
import { retryRPC } from "./utils/retryRPC";
import { switchNetwork } from "./utils/network";

export class PyraZone extends DataAssetBase {
  pyraZone;

  constructor({
    chainId,
    connector,
    assetId
  }: {
    chainId?: number;
    connector: Connector;
    assetId?: string;
  }) {
    const assetContract =
      DEPLOYED_ADDRESSES[chainId as keyof typeof DEPLOYED_ADDRESSES]?.PyraZone;
    super({
      chainId,
      connector,
      assetContract,
      assetId
    });
    if (!this.signer) {
      throw new Error("Signer not found, please connect wallet");
    }
    this.pyraZone = PyraZone__factory.connect(assetContract, this.signer);
  }

  public async createPyraZone() {
    if (this.assetId) {
      return this.assetId;
    }

    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await switchNetwork({ connector: this.connector, chainId: this.chainId });

    const data: string = "0x";
    const actions: string[] = [];
    const actionInitDatas: string[] = [];

    const publishParams: PublishParams = {
      data,
      actions,
      actionInitDatas
    };
    return await this.createAssetHandler(publishParams);
  }

  public async createTierkey() {
    if (!this.assetId) {
      throw new Error(
        "AssetId cannot be empty, please call createAssetHandler first"
      );
    }

    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await switchNetwork({ connector: this.connector, chainId: this.chainId });

    const tx = await this.pyraZone.createTierkey(this.assetId);
    const receipt = await tx.wait();
    const targetEvents = receipt.events?.filter(
      (e: any) => e.event === "TierkeyCreated"
    );
    if (!targetEvents || targetEvents.length === 0 || !targetEvents[0].args) {
      throw new Error("Filter TierkeyCreated event failed");
    }
    return {
      tier: targetEvents[0].args[1] as number,
      tierkey: targetEvents[0].args[2] as string
    };
  }

  public async buyTierkey(tier: BigNumberish) {
    if (!this.assetId) {
      throw new Error(
        "AssetId cannot be empty, please call createAssetHandler first"
      );
    }

    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await switchNetwork({ connector: this.connector, chainId: this.chainId });

    const totalPrice = await this.pyraZone.getTierkeyPriceAfterFee(
      this.assetId,
      tier,
      TradeType.Buy
    );

    const tx = await this.pyraZone.buyTierkey(this.assetId, tier, {
      value: totalPrice
    });
    const receipt = await tx.wait();
    const targetEvents = receipt.events?.filter(
      (e: any) => e.event === "TierkeyBought"
    );
    if (!targetEvents || targetEvents.length === 0 || !targetEvents[0].args) {
      throw new Error("Filter TierkeyBought event failed");
    }
    const keyId: string = targetEvents[0].args[2];
    return keyId;
  }

  public async sellTierkey({
    tier,
    keyId
  }: {
    tier: BigNumberish;
    keyId: BigNumberish;
  }) {
    if (!this.assetId) {
      throw new Error(
        "AssetId cannot be empty, please call createAssetHandler first"
      );
    }

    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await switchNetwork({ connector: this.connector, chainId: this.chainId });

    const tx = await this.pyraZone.sellTierkey(this.assetId, tier, keyId);
    await tx.wait();
  }

  public async skim() {
    if (!this.assetId) {
      throw new Error(
        "AssetId cannot be empty, please call createAssetHandler first"
      );
    }

    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    await switchNetwork({ connector: this.connector, chainId: this.chainId });

    const tx = await this.pyraZone.skim(this.assetId);
    const receipt = await tx.wait();

    const targetEvents = receipt.events?.filter(
      (e: any) => e.event === "Skimed"
    );
    if (!targetEvents || targetEvents.length === 0 || !targetEvents[0].args) {
      throw new Error("Filter Skimed event failed");
    }
    const skimAmount: BigNumber = targetEvents[0].args[4];
    return skimAmount;
  }

  public async loadZoneAsset() {
    if (!this.assetId) {
      throw new Error(
        "AssetId cannot be empty, please call createAssetHandler first"
      );
    }

    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    if (!this.assetContract) {
      throw new Error(
        "AssetContract cannot be empty, please pass in through constructor"
      );
    }

    const zoneAsset = await retryRPC({
      chainId: this.chainId,
      contractFactory: "pyraZone__factory",
      contractAddress: this.assetContract,
      method: "getZoneAsset",
      params: [this.assetId]
    });

    return zoneAsset;
  }

  public async loadTierkeyBalance({
    tier,
    address
  }: {
    tier: number;
    address: string;
  }) {
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    const zoneAsset = await this.loadZoneAsset();
    const tierkey = zoneAsset.tierkeys[tier];

    const balance = await retryRPC({
      chainId: this.chainId,
      contractFactory: "tierkey__factory",
      contractAddress: tierkey,
      method: "balanceOf",
      params: [address]
    });

    return balance;
  }

  public async loadBuyPrice(tier: BigNumberish) {
    if (!this.assetId) {
      throw new Error(
        "AssetId cannot be empty, please call createAssetHandler first"
      );
    }

    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    if (!this.assetContract) {
      throw new Error(
        "AssetContract cannot be empty, please pass in through constructor"
      );
    }

    const price = await retryRPC({
      chainId: this.chainId,
      contractFactory: "pyraZone__factory",
      contractAddress: this.assetContract,
      method: "getTierkeyPrice",
      params: [this.assetId, tier, TradeType.Buy]
    });

    return price;
  }

  public async loadSellPrice(tier: BigNumberish) {
    if (!this.assetId) {
      throw new Error(
        "AssetId cannot be empty, please call createAssetHandler first"
      );
    }

    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    if (!this.assetContract) {
      throw new Error(
        "AssetContract cannot be empty, please pass in through constructor"
      );
    }

    const price = await retryRPC({
      chainId: this.chainId,
      contractFactory: "pyraZone__factory",
      contractAddress: this.assetContract,
      method: "getTierkeyPrice",
      params: [this.assetId, tier, TradeType.Sell]
    });

    return price;
  }

  public async isAccessible({
    tier,
    account
  }: {
    tier: BigNumberish;
    account: string;
  }) {
    if (!this.assetId) {
      throw new Error(
        "AssetId cannot be empty, please call createAssetHandler first"
      );
    }

    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }

    if (!this.assetContract) {
      throw new Error(
        "AssetContract cannot be empty, please pass in through constructor"
      );
    }

    const res = await retryRPC({
      chainId: this.chainId,
      contractFactory: "pyraZone__factory",
      contractAddress: this.assetContract,
      method: "isAccessible",
      params: [this.assetId, account, tier]
    });

    return res;
  }

  async applyConditionsToFile({
    fileId,
    linkedAsset,
    attached
  }: {
    fileId?: string;
    linkedAsset?: DataAsset;
    attached?: Attached;
  }) {
    this.signer &&
      this.addGeneralCondition([
        {
          conditionType: "evmBasic",
          contractAddress: "",
          standardContractType: "",
          chain: "ethereum",
          method: "",
          parameters: [":userAddress"],
          returnValueTest: {
            comparator: "=",
            value: await this.signer.getAddress()
          }
        }
      ]);

    await this.addLinkCondition({
      acl: {
        conditionType: "evmContract",
        functionName: "isAccessible",
        functionAbi: {
          inputs: [
            {
              internalType: "bytes32",
              name: "assetId",
              type: "bytes32"
            },
            {
              internalType: "address",
              name: "account",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "tier",
              type: "uint256"
            }
          ],
          name: "isAccessible",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        returnValueTest: {
          key: "",
          comparator: "=",
          value: "true"
        }
      },
      linkedAsset,
      attached
    });

    const res = await this.applyFileConditions(fileId);

    return res;
  }

  async applyConditionsToFolder({
    folderId,
    linkedAsset,
    attached
  }: {
    folderId?: string;
    linkedAsset?: DataAsset;
    attached?: Attached;
  }) {
    this.signer &&
      this.addGeneralCondition([
        {
          conditionType: "evmBasic",
          contractAddress: "",
          standardContractType: "",
          chain: "ethereum",
          method: "",
          parameters: [":userAddress"],
          returnValueTest: {
            comparator: "=",
            value: await this.signer.getAddress()
          }
        }
      ]);

    await this.addLinkCondition({
      acl: {
        conditionType: "evmContract",
        functionName: "isAccessible",
        functionAbi: {
          inputs: [
            {
              internalType: "bytes32",
              name: "assetId",
              type: "bytes32"
            },
            {
              internalType: "address",
              name: "account",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "tier",
              type: "uint256"
            }
          ],
          name: "isAccessible",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        returnValueTest: {
          key: "",
          comparator: "=",
          value: "true"
        }
      },
      linkedAsset,
      attached
    });

    const res = await this.applyFolderConditions(folderId);

    return res;
  }

  public async createTierFile({
    modelId,
    fileName,
    fileContent,
    tier
  }: {
    modelId: string;
    fileName?: string;
    fileContent: FileContent;
    tier: number;
  }) {
    if (!this.assetId) {
      throw new Error(
        "AssetId cannot be empty, please call createAssetHandler first"
      );
    }
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }
    if (!this.assetContract) {
      throw new Error(
        "AssetContract cannot be empty, please pass in through constructor"
      );
    }
    if (!tier && tier !== 0) {
      throw new Error("Tier cannot be empty");
    }

    const folders = await this.connector.runOS({
      method: SYSTEM_CALL.loadFolderTrees
    });

    const zoneAsset = await this.loadZoneAsset();
    const tierkey = zoneAsset.tierkeys[tier];

    const folder = Object.values(folders).find(
      (folder) =>
        folder.options?.signals?.find(
          (signal) =>
            signal.type === SignalType.asset && signal.id === this.assetId
        ) &&
        folder.options?.signals?.find(
          (signal) => signal.type === SignalType.asset && signal.id === tierkey
        )
    );

    let folderId = folder?.folderId;

    if (!folder) {
      const res = await this.connector.runOS({
        method: SYSTEM_CALL.createFolder,
        params: {
          folderName: `assetId:${this.assetId},tierkey:${tierkey}`,
          folderType: FolderType.UnionFolderType,
          signals: [
            {
              type: SignalType.asset,
              id: this.assetId
            },
            {
              type: SignalType.asset,
              id: tierkey
            }
          ]
        }
      });
      folderId = res.newFolder.folderId;
      await this.applyConditionsToFolder({
        folderId,
        linkedAsset: {
          assetId: this.assetId,
          assetContract: this.assetContract,
          chainId: this.chainId
        },
        attached: {
          tier
        }
      });
    }

    const res = await this.connector.runOS({
      method: SYSTEM_CALL.createIndexFile,
      params: {
        modelId,
        fileName,
        fileContent,
        folderId
      }
    });

    const applyConditionsToFileRes = await this.applyConditionsToFile({
      fileId: res.fileContent.file.fileId,
      linkedAsset: {
        assetId: this.assetId,
        assetContract: this.assetContract,
        chainId: this.chainId
      },
      attached: {
        tier
      }
    });

    return applyConditionsToFileRes;
  }

  public async addTierFile({ fileId, tier }: { fileId: string; tier: number }) {
    if (!this.assetId) {
      throw new Error(
        "AssetId cannot be empty, please call createAssetHandler first"
      );
    }
    if (!this.chainId) {
      throw new Error(
        "ChainId cannot be empty, please pass in through constructor"
      );
    }
    if (!this.assetContract) {
      throw new Error(
        "AssetContract cannot be empty, please pass in through constructor"
      );
    }
    if (!tier && tier !== 0) {
      throw new Error("Tier cannot be empty");
    }

    const zoneAsset = await this.loadZoneAsset();
    const tierkey = zoneAsset.tierkeys[tier];

    const folders = await this.connector.runOS({
      method: SYSTEM_CALL.loadFolderTrees
    });

    const folder = Object.values(folders).find(
      (folder) =>
        folder.options?.signals?.find(
          (signal) =>
            signal.type === SignalType.asset && signal.id === this.assetId
        ) &&
        folder.options?.signals?.find(
          (signal) => signal.type === SignalType.asset && signal.id === tierkey
        )
    );

    let folderId = folder?.folderId;
    if (!folder) {
      const res = await this.connector.runOS({
        method: SYSTEM_CALL.createFolder,
        params: {
          folderName: `assetId:${this.assetId},tierkey:${tierkey}`,
          folderType: FolderType.UnionFolderType,
          signals: [
            {
              type: SignalType.asset,
              id: this.assetId
            },
            {
              type: SignalType.asset,
              id: tierkey
            }
          ]
        }
      });
      folderId = res.newFolder.folderId;
      await this.applyConditionsToFolder({
        folderId,
        linkedAsset: {
          assetId: this.assetId,
          assetContract: this.assetContract,
          chainId: this.chainId
        },
        attached: {
          tier
        }
      });
    }

    const applyConditionsToFileRes = await this.applyConditionsToFile({
      fileId,
      linkedAsset: {
        assetId: this.assetId,
        assetContract: this.assetContract,
        chainId: this.chainId
      },
      attached: {
        tier
      }
    });

    await this.connector.runOS({
      method: SYSTEM_CALL.moveFiles,
      params: {
        targetFolderId: folderId!,
        fileIds: [fileId]
      }
    });

    return applyConditionsToFileRes;
  }

  public async loadFolderInPyraZone(pyraZoneId: string) {
    if (!pyraZoneId) {
      throw new Error("PyraZoneId cannot be empty");
    }

    const folders = await this.connector.runOS({
      method: SYSTEM_CALL.loadFoldersBy,
      params: { signals: [{ type: SignalType.asset, id: pyraZoneId }] }
    });

    return Object.values(folders)[0];
  }

  public async loadFoldersByTier(tier: number) {
    if (!tier && tier !== 0) {
      throw new Error("Tier cannot be empty");
    }

    const zoneAsset = await this.loadZoneAsset();
    const tierkey = zoneAsset.tierkeys[tier];

    const res = await this.connector.runOS({
      method: SYSTEM_CALL.loadFoldersBy,
      params: { signals: [{ type: SignalType.asset, id: tierkey }] }
    });

    return res;
  }

  public async loadFilesInPyraZone(pyraZoneId: string) {
    if (!pyraZoneId) {
      throw new Error("PyraZoneId cannot be empty");
    }

    const res = await this.connector.runOS({
      method: SYSTEM_CALL.loadFoldersBy,
      params: { signals: [{ type: SignalType.asset, id: pyraZoneId }] }
    });

    return Object.assign(
      {},
      ...Object.values(res).map((item) =>
        Object.fromEntries(
          Object.values(item.mirrorRecord).map((mirror) => [
            mirror.mirrorId,
            mirror.mirrorFile
          ])
        )
      )
    );
  }

  public async loadFilesByTier(tier: number) {
    if (!tier && tier !== 0) {
      throw new Error("Tier cannot be empty");
    }

    const zoneAsset = await this.loadZoneAsset();
    const tierkey = zoneAsset.tierkeys[tier];

    const res = await this.connector.runOS({
      method: SYSTEM_CALL.loadFoldersBy,
      params: { signals: [{ type: SignalType.asset, id: tierkey }] }
    });

    return Object.assign(
      {},
      ...Object.values(res).map((item) =>
        Object.fromEntries(
          Object.values(item.mirrorRecord).map((mirror) => [
            mirror.mirrorId,
            mirror.mirrorFile
          ])
        )
      )
    );
  }

  public async loadFilesByPkh({
    modelId,
    pkh
  }: {
    modelId: string;
    pkh: string;
  }) {
    const res = await this.connector.runOS({
      method: SYSTEM_CALL.loadFilesBy,
      params: {
        modelId,
        pkh
      }
    });
    return res;
  }

  static async loadPyraZones({
    chainId,
    assetIds,
    publishers,
    page,
    pageSize,
    orderBy,
    orderType,
    recentTime
  }: {
    chainId?: number;
    assetIds?: string[];
    publishers?: string[];
    page?: number;
    pageSize?: number;
    orderBy?: "block_number" | "tierkey_sales";
    orderType?: "asc" | "desc";
    recentTime?: number;
  }) {
    const pyraZones: PyraZoneRes[] = (
      await http.request({
        url: `${chainId || "*"}/pyra-marketplace/pyra-zone`,
        method: "get",
        params: {
          asset_ids: assetIds?.join(","),
          publishers: publishers?.join(","),
          page,
          page_size: pageSize,
          order_by: orderBy,
          order_type: orderType,
          recent_time: recentTime
        }
      })
    ).data;
    return pyraZones;
  }

  static async loadPyraZoneTierkeyHolders({
    chainId,
    assetId,
    tier,
    tierkey,
    page,
    pageSize,
    orderBy,
    orderType
  }: {
    chainId?: number;
    assetId?: string;
    tier?: number;
    tierkey?: string;
    page?: number;
    pageSize?: number;
    orderBy?: "key_id";
    orderType?: "asc" | "desc";
  }) {
    const tierkeyHolders: PyraZoneTierkeyHolderRes[] = (
      await http.request({
        url: `${chainId || "*"}/pyra-marketplace/pyra-zone/tierkey/holder`,
        method: "get",
        params: {
          asset_id: assetId,
          tier,
          tierkey,
          page,
          page_size: pageSize,
          order_by: orderBy,
          order_type: orderType
        }
      })
    ).data;
    return tierkeyHolders;
  }

  static async loadPyraZoneTierkeyActivities({
    chainId,
    assetId,
    tier,
    tierkey,
    page,
    pageSize,
    orderBy,
    orderType
  }: {
    chainId?: number;
    assetId?: string;
    tier?: number;
    tierkey?: string;
    page?: number;
    pageSize?: number;
    orderBy?: "block_number";
    orderType?: "asc" | "desc";
  }) {
    const tierkeyActivities: PyraZoneTierkeyActivityRes[] = (
      await http.request({
        url: `${chainId || "*"}/pyra-marketplace/pyra-zone/tierkey/activity`,
        method: "get",
        params: {
          asset_id: assetId,
          tier,
          tierkey,
          page,
          page_size: pageSize,
          order_by: orderBy,
          order_type: orderType
        }
      })
    ).data;
    return tierkeyActivities;
  }

  async unlockFile(fileId: string) {
    const res = await this.connector.runOS({
      method: SYSTEM_CALL.unlockFile,
      params: fileId
    });
    return res;
  }

  async unlockFolder(folderId: string) {
    const res = await this.connector.runOS({
      method: SYSTEM_CALL.unlockFolder,
      params: folderId
    });
    return res;
  }
}
