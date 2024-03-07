import { BigNumberish } from "ethers";
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
import { ChainId, PyraZoneRes, PyraZoneTierkeyActivityRes, PyraZoneTierkeyHolderRes, ZoneAsset } from "./types";
import { PyraZone__factory } from "./abi/typechain";
import { DEPLOYED_ADDRESSES } from "./addresses";
import { TradeType } from "./types";
import { abiCoder } from "@pyra-marketplace/assets-sdk";
import { http } from "./utils";

export class PyraZone extends DataAssetBase {
  pyraZone;

  constructor({
    chainId,
    connector,
    assetId
  }: {
    chainId?: ChainId;
    connector: Connector;
    assetId?: string;
  }) {
    const assetContract = DEPLOYED_ADDRESSES[chainId!]?.PyraZone;
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

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const expiration = 3600 * 24 * 7; // 1 week
    const data: string = abiCoder.encode(["uint256"], [expiration]);
    const actions: string[] = [];
    const actionInitDatas: string[] = [];

    const publishParams: PublishParams = {
      data,
      actions,
      actionInitDatas
    };
    return await this.createAssetHandler(publishParams);
  }

  public async createTierkey(expiration: BigNumberish) {
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

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const tx = await this.pyraZone.createTierkey(this.assetId, expiration);
    const receipt = await tx.wait();
    const targetEvents = receipt.events?.filter(
      (e: any) => e.event === "TierkeyCreated"
    );
    if (!targetEvents || targetEvents.length === 0 || !targetEvents[0].args) {
      throw new Error("Filter TierkeyCreated event failed");
    }
    return {
      tier: targetEvents[0].args[1],
      tierkeyId: targetEvents[0].args[2]
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

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const totalPrice = await this.pyraZone.getTierkeyPriceAfterFee(
      this.assetId,
      tier,
      TradeType.Buy
    );

    console.log("totalPrice:", totalPrice);

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

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const tx = await this.pyraZone.sellTierkey(this.assetId, tier, keyId, {
      gasPrice: 2000,
      gasLimit: 200000
    });
    await tx.wait();
  }

  public async getZoneAsset() {
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

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const zoneAsset: ZoneAsset = await this.pyraZone.getZoneAsset(this.assetId);
    return zoneAsset;
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

    await this.connector.getProvider().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${this.chainId.toString(16)}` }]
    });

    const res = await this.pyraZone.isAccessible(this.assetId, account, tier);

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

  public async createTierFile({
    modelId,
    fileName,
    fileContent,
    tierkeyId
  }: {
    modelId: string;
    fileName?: string;
    fileContent: FileContent;
    tierkeyId: string;
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
    if (!tierkeyId) {
      throw new Error("TierkeyId cannot be empty");
    }

    const folders = await this.connector.runOS({
      method: SYSTEM_CALL.loadFolderTrees
    });

    const folder = Object.values(folders).find(
      (folder) =>
        folder.options?.signals?.find(
          (signal) =>
            signal.type === SignalType.asset && signal.id === this.assetId
        )
    );
    console.log(folder);

    let folderId = folder?.folderId;
    if (!folder) {
      const res = await this.connector.runOS({
        method: SYSTEM_CALL.createFolder,
        params: {
          folderName: `${SignalType[SignalType.asset]}:${this.assetId}`,
          folderType: FolderType.PrivateFolderType,
          signals: [
            {
              type: SignalType.asset,
              id: this.assetId
            },
            {
              type: SignalType.asset,
              id: tierkeyId
            }
          ]
        }
      });
      folderId = res.newFolder.folderId;
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
        tierkeyId
      }
    });

    return applyConditionsToFileRes;
  }

  public async addTierFile({
    fileId,
    tierkeyId
  }: {
    fileId: string;
    tierkeyId: string;
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
    if (!tierkeyId) {
      throw new Error("TierkeyId cannot be empty");
    }

    const applyConditionsToFileRes = await this.applyConditionsToFile({
      fileId,
      linkedAsset: {
        assetId: this.assetId,
        assetContract: this.assetContract,
        chainId: this.chainId
      },
      attached: {
        tierkeyId
      }
    });

    const folders = await this.connector.runOS({
      method: SYSTEM_CALL.loadFolderTrees
    });

    const folder = Object.values(folders).find(
      (folder) =>
        folder.options?.signals?.find(
          (signal) =>
            signal.type === SignalType.asset && signal.id === this.assetId
        )
    );

    let folderId = folder?.folderId;
    if (!folder) {
      const res = await this.connector.runOS({
        method: SYSTEM_CALL.createFolder,
        params: {
          folderName: `${SignalType[SignalType.asset]}:${this.assetId}`,
          folderType: FolderType.PrivateFolderType,
          signals: [
            {
              type: SignalType.asset,
              id: this.assetId
            },
            {
              type: SignalType.asset,
              id: tierkeyId
            }
          ]
        }
      });
      folderId = res.newFolder.folderId;
    }

    await this.connector.runOS({
      method: SYSTEM_CALL.moveFiles,
      params: {
        targetFolderId: folderId!,
        fileIds: [fileId]
      }
    });

    return applyConditionsToFileRes;
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
      ...Object.values(res).map((item) => item.mirrorRecord)
    );
  }

  public async loadFilesByTierkey(tierkeyId: string) {
    if (!tierkeyId) {
      throw new Error("TierkeyId cannot be empty");
    }

    const res = await this.connector.runOS({
      method: SYSTEM_CALL.loadFoldersBy,
      params: { signals: [{ type: SignalType.asset, id: tierkeyId }] }
    });

    return Object.assign(
      {},
      ...Object.values(res).map((item) => item.mirrorRecord)
    );
  }

  static async loadPyraZones({
    chainId,
    assetIds,
    publishers
  }: {
    chainId?: number;
    assetIds?: string[];
    publishers?: string[];
  }) {
    const pyraZones: PyraZoneRes[] = await http.request({
      url: `${chainId || "*"}/pyra-marketplace/pyra-zone`,
      method: "get",
      params: {
        asset_ids: assetIds?.join(','),
        publishers: publishers?.join(',')
      }
    });
    return pyraZones
  }

  static async loadPyraZoneTierkeyHolders({chainId, assetId, tier, tierkey}: {chainId?: number, assetId?: string, tier?: number, tierkey?: string}) {
    const tierkeyHolders: PyraZoneTierkeyHolderRes[] = await http.request({
      url: `${chainId || "*"}/pyra-marketplace/pyra-zone/tierkey/holder`,
      method: "get",
      params: {
        asset_id: assetId,
        tier,
        tierkey
      }
    });
    return tierkeyHolders
  }

  static async loadPyraZoneTierkeyActivities({chainId, assetId, tier, tierkey}: {chainId?: number, assetId?: string, tier?: number, tierkey?: string}) {
    const tierkeyActivities: PyraZoneTierkeyActivityRes[] = await http.request({
      url: `${chainId || "*"}/pyra-marketplace/pyra-zone/tierkey/activity`,
      method: "get",
      params: {
        asset_id: assetId,
        tier,
        tierkey
      }
    });
    return tierkeyActivities
  }
}
