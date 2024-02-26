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
import { ChainId, ZoneAsset } from "../types";
import { PyraZone__factory } from "./abi/typechain";
import { DEPLOYED_ADDRESSES } from "./addresses";
import { TradeType } from "./types";

export class PyraZone extends DataAssetBase {
  constructor({
    chainId,
    connector,
    fileId,
    assetId
  }: {
    chainId?: ChainId;
    connector: Connector;
    fileId?: string;
    assetId?: string;
  }) {
    super({
      chainId,
      connector,
      assetContract: DEPLOYED_ADDRESSES[chainId!]?.PyraZone,
      fileOrFolderId: fileId,
      assetId
    });
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

  public async createTierkey(expiration: BigNumberish) {
    if (!this.assetContract) {
      throw new Error(
        "AssetContract cannot be empty, please pass in through constructor"
      );
    }
    if (!this.assetId) {
      throw new Error(
        "AssetId cannot be empty, please call createAssetHandler first"
      );
    }
    if (!this.signer) {
      throw new Error("Signer not found, please collect wallet");
    }
    const pyraZone = PyraZone__factory.connect(this.assetContract, this.signer);
    const tx = await pyraZone.createTierkey(this.assetId, expiration);
    const receipt = await tx.wait();
    const targetEvents = receipt.events?.filter(
      (e: any) => e.event === "TierkeyCreated"
    );
    if (!targetEvents || targetEvents.length === 0 || !targetEvents[0].args) {
      throw new Error("Filter TierkeyCreated event failed");
    }
    const tierkey: string = targetEvents[0].args[2];
    return tierkey;
  }

  public async buyTierkey() {
    if (!this.assetContract) {
      throw new Error(
        "AssetContract cannot be empty, please pass in through constructor"
      );
    }
    if (!this.assetId) {
      throw new Error(
        "AssetId cannot be empty, please call createAssetHandler first"
      );
    }
    if (!this.signer) {
      throw new Error("Signer not found, please collect wallet");
    }
    const tier =
      this.monetizationProvider?.dependencies?.[0]?.attached?.["tierkey"];
    const pyraZone = PyraZone__factory.connect(this.assetContract, this.signer);
    const totalPrice = pyraZone.getTierkeyPriceAfterFee(
      this.assetId,
      tier,
      TradeType.Buy
    );
    const tx = await pyraZone.buyTierkey(this.assetId, tier, {
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

  public async sellTierkey(keyId: BigNumberish) {
    if (!this.assetContract) {
      throw new Error(
        "AssetContract cannot be empty, please pass in through constructor"
      );
    }
    if (!this.assetId) {
      throw new Error(
        "AssetId cannot be empty, please call createAssetHandler first"
      );
    }
    if (!this.signer) {
      throw new Error("Signer not found, please collect wallet");
    }
    const tier =
      this.monetizationProvider?.dependencies?.[0]?.attached?.["tierkey"];
    const pyraZone = PyraZone__factory.connect(this.assetContract, this.signer);
    const tx = await pyraZone.sellTierkey(this.assetId, tier, keyId);
    await tx.wait();
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

  // async createTokenFile({
  //   modelId,
  //   fileName,
  //   fileContent,
  //   timestamp,
  //   withSig
  // }: {
  //   modelId: string;
  //   fileName?: string;
  //   fileContent: FileContent;
  //   timestamp?: number;
  //   withSig?: boolean;
  // }) {
  //   const createIndexFileRes = await this.connector.runOS({
  //     method: SYSTEM_CALL.createIndexFile,
  //     params: {
  //       modelId,
  //       fileName,
  //       fileContent
  //     }
  //   });

  //   this.fileOrFolderId = createIndexFileRes.fileContent.file.fileId;

  //   await this.publish(withSig);

  //   const applyConditionsToFileRes =
  //     await this.applyConditionsToFile(timestamp);

  //   return applyConditionsToFileRes;
  // }

  // async monetizeFile({
  //   actionsConfig,
  //   withSig
  // }: {
  //   actionsConfig: {
  //     collectAction?: {
  //       currency: string;
  //       amount: BigNumberish;
  //       totalSupply?: BigNumberish;
  //     };
  //   };
  //   withSig?: boolean;
  // }) {
  //   if (!this.fileOrFolderId) {
  //     throw new Error("File Id cannot be empty");
  //   }

  //   const res = await this.connector.runOS({
  //     method: SYSTEM_CALL.loadFile,
  //     params: this.fileOrFolderId
  //   });

  //   await this.publish({
  //     resourceId:
  //       "test-resource-id" ?? res.fileContent.file?.contentType?.resourceId,
  //     actionsConfig,
  //     withSig
  //   });

  //   const applyConditionsToFileRes = await this.applyConditionsToFile();

  //   return applyConditionsToFileRes;
  // }

  public async getZoneAsset() {
    if (!this.assetContract) {
      throw new Error(
        "AssetContract cannot be empty, please pass in through constructor"
      );
    }
    if (!this.assetId) {
      throw new Error(
        "AssetId cannot be empty, please call createAssetHandler first"
      );
    }
    if (!this.signer) {
      throw new Error("Signer not found, please collect wallet");
    }
    const pyraZone = PyraZone__factory.connect(this.assetContract, this.signer);
    const zoneAsset: ZoneAsset = await pyraZone.getZoneAsset(this.assetId);
    return zoneAsset;
  }

  public async isAccessible() {
    if (!this.assetContract) {
      throw new Error(
        "AssetContract cannot be empty, please pass in through constructor"
      );
    }
    if (!this.assetId) {
      throw new Error(
        "AssetId cannot be empty, please call createAssetHandler first"
      );
    }
    if (!this.signer) {
      throw new Error("Signer not found, please collect wallet");
    }

    const pyraZone = PyraZone__factory.connect(this.assetContract, this.signer);
    const tier =
      this.monetizationProvider?.dependencies?.[0]?.attached?.["tierkey"];
    const account = await this.signer.getAddress();
    const res = await pyraZone.isAccessible(this.assetId, tier, account);

    return res;
  }

  public async createTierkeyFile({
    modelId,
    fileName,
    fileContent,
    tierkey
  }: {
    modelId: string;
    fileName?: string;
    fileContent: FileContent;
    tierkey: string;
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

    const folders = await this.connector.runOS({
      method: SYSTEM_CALL.loadFolderTrees
    });

    const folder = Object.values(folders).find(
      (folder) =>
        folder.options?.signal?.type === SignalType.asset &&
        folder.options?.signal?.id === this.assetId
    );

    let folderId = folder?.folderId;
    if (!folder) {
      const res = await this.connector.runOS({
        method: SYSTEM_CALL.createFolder,
        params: {
          folderName: `${SignalType[SignalType.asset]}:${this.assetId}`,
          folderType: FolderType.PublicFolderType,
          signals: [
            {
              type: SignalType.asset,
              id: this.assetId
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
        tierkey
      }
    });

    return applyConditionsToFileRes;
  }

  public async addTierKeyFile({
    fileId,
    tierkey
  }: {
    fileId: string;
    tierkey: string;
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

    const applyConditionsToFileRes = await this.applyConditionsToFile({
      fileId,
      linkedAsset: {
        assetId: this.assetId,
        assetContract: this.assetContract,
        chainId: this.chainId
      },
      attached: {
        tierkey
      }
    });

    const folders = await this.connector.runOS({
      method: SYSTEM_CALL.loadFolderTrees
    });

    const folder = Object.values(folders).find(
      (folder) =>
        folder.options?.signal?.type === SignalType.asset &&
        folder.options?.signal?.id === this.assetId
    );

    let folderId = folder?.folderId;
    if (!folder) {
      const res = await this.connector.runOS({
        method: SYSTEM_CALL.createFolder,
        params: {
          folderName: `${SignalType[SignalType.asset]}:${this.assetId}`,
          folderType: FolderType.PublicFolderType,
          signals: [
            {
              type: SignalType.asset,
              id: this.assetId
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
      throw new Error("groupId cannot be empty");
    }

    const res = await this.connector.runOS({
      method: SYSTEM_CALL.loadFoldersBy,
      params: { signal: { type: SignalType.asset, id: pyraZoneId } }
    });

    return Object.assign(
      {},
      ...Object.values(res).map((item) => item.mirrorRecord)
    );
  }

  // public async loadFilesByTierkey(tierkey: string) {
  //   if (!tierkey) {
  //     throw new Error("Tierkey cannot be empty");
  //   }

  //   const res = await this.connector.runOS({
  //     method: SYSTEM_CALL.loadFoldersBy,
  //     params: { attached: { tierkey } }
  //   });

  //   return Object.assign(
  //     {},
  //     ...Object.values(res).map((item) => item.mirrorRecord)
  //   );
  // }
}
