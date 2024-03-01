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
import { ChainId, ZoneAsset } from "./types";
import { PyraZone__factory } from "./abi/typechain";
import { DEPLOYED_ADDRESSES } from "./addresses";
import { TradeType } from "./types";

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
      throw new Error("Signer not found, please collect wallet");
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
    return targetEvents[0].args[1];
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

    const tx = await this.pyraZone.sellTierkey(this.assetId, tier, keyId);
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

    const res = await this.pyraZone.isAccessible(this.assetId, tier, account);

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
    tier
  }: {
    modelId: string;
    fileName?: string;
    fileContent: FileContent;
    tier: string;
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
        tier
      }
    });

    return applyConditionsToFileRes;
  }

  public async addTierFile({ fileId, tier }: { fileId: string; tier: string }) {
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
        tier
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
