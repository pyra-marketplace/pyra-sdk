import React from "react";
import {
  Connector,
  SYSTEM_CALL,
  MeteorWalletProvider
} from "@meteor-web3/connector";
import { DataAssetParser } from "@pyra-marketplace/assets-sdk/data-asset";
import { PyraZone } from "../../src/pyra-zone";
import "./App.scss";
import { ChainId } from "../../src/types";

const connector = new Connector(new MeteorWalletProvider());

export const appId = "9aaae63f-3445-47d5-8785-c23dd16e4965";

const postModelId =
  "kjzl6hvfrbw6c8h0oiiv2ccikb2thxsu98sy0ydi6oshj6sjuz9dga94463anvf";

const chainId = ChainId.PolygonMumbai;

const postVersion = "0.0.1";

let indexFileId: string;

let tierkey: string;

let keyId: string;

function App() {
  const [pkh, setPkh] = React.useState("");

  const createCapability = async () => {
    const connectWalletRes = await connector.connectWallet({
      provider: (window as any).ethereum
    });
    console.log(connectWalletRes.address);
    const createCapabilityRes = await connector.runOS({
      method: SYSTEM_CALL.createCapability,
      params: {
        appId
      }
    });
    setPkh(createCapabilityRes.pkh);
    console.log(createCapabilityRes.pkh);
    return createCapabilityRes.pkh;
  };

  /*** wirte operation */
  const createPyraZone = async () => {
    const pyraZone = new PyraZone({
      chainId,
      connector
    });

    const res = await pyraZone.createPyraZone();
    console.log(res);
  };

  const createTierkey = async () => {
    const pyraZone = new PyraZone({
      chainId,
      connector
    });

    tierkey = await pyraZone.createTierkey(10);
    console.log(tierkey);
  };

  const createTierkeyFile = async () => {
    const pyraZone = new PyraZone({
      chainId,
      connector
    });

    const date = new Date().toISOString();

    const res = await pyraZone.createTierkeyFile({
      modelId: postModelId,
      fileName: "create a file",
      fileContent: {
        modelVersion: postVersion,
        text: "hello",
        images: [
          "https://bafkreib76wz6wewtkfmp5rhm3ep6tf4xjixvzzyh64nbyge5yhjno24yl4.ipfs.w3s.link"
        ],
        videos: [],
        createdAt: date,
        updatedAt: date,
        encrypted: JSON.stringify({
          text: true,
          images: false,
          videos: false
        })
      },
      tierkey
    });
    indexFileId = res.fileContent.file.fileId;
    console.log("DataToken collected, keyId:", keyId);
    console.log(res);
  };

  const buyFile = async () => {
    const dataAssetParser = new DataAssetParser(connector);
    const dataAsset = await dataAssetParser.parse(indexFileId);

    const pyraZone = new PyraZone({
      chainId: dataAsset.chainId as ChainId,
      fileId: dataAsset.fileOrFolderId,
      assetId: dataAsset.assetId,
      connector
    });

    keyId = await pyraZone.buyTierkey();
    console.log("DataToken collected, keyId:", keyId);
    return keyId;
  };

  const isBought = async () => {
    const dataAssetParser = new DataAssetParser(connector);
    const dataAsset = await dataAssetParser.parse(indexFileId);

    const pyraZone = new PyraZone({
      chainId: dataAsset.chainId as ChainId,
      fileId: dataAsset.fileOrFolderId,
      assetId: dataAsset.assetId,
      connector
    });

    const res = await pyraZone!.isAccessible();
    console.log(res);

    return res;
  };

  const unlockFile = async () => {
    try {
      const res = await connector.runOS({
        method: SYSTEM_CALL.unlockFile,
        params: indexFileId
      });
      console.log(res);
    } catch (error) {
      console.error(error);
    }
  };

  const isFileUnlocked = async () => {
    try {
      const res = await connector.runOS({
        method: SYSTEM_CALL.isFileUnlocked,
        params: indexFileId
      });
      console.log(res);
    } catch (error) {
      console.error(error);
    }
  };

  const sellFile = async () => {
    const dataAssetParser = new DataAssetParser(connector);
    const dataAsset = await dataAssetParser.parse(indexFileId);

    const pyraZone = new PyraZone({
      chainId: dataAsset.chainId as ChainId,
      fileId: dataAsset.fileOrFolderId,
      assetId: dataAsset.assetId,
      connector
    });

    await pyraZone!.sellTierkey(keyId);
    console.log("pyraZone sold");
  };

  /*** wirte operation */

  /*** read operation */
  // const loadCreatedTokenFiles = async () => {
  //   const dataToken = new DataToken({
  //     connector
  //   });
  //   const res = await dataToken.loadCreatedTokenFiles(address);
  //   console.log(res);
  // };

  // const loadCollectedTokenFiles = async () => {
  //   const dataToken = new DataToken({
  //     connector
  //   });
  //   const res = await dataToken.loadCollectedTokenFiles(address);
  //   console.log(res);
  // };

  // const loadDatatokens = async () => {
  //   const dataTokenIds = [
  //     "0xd5a9fA9B780a92091B789e57B794c1dd86F3D134",
  //     "0xc4bc152f88b23c5cBD26d7447706C7A55bB953c0",
  //     "0xee81E5318d2CBEF8d08080dA6a931d9f502208A9"
  //   ];

  //   const res = await loadDataTokens(dataTokenIds);

  //   console.log(res);
  // };

  // const isDatatokenCollectedBy = async () => {
  //   const dataTokenId = "0x50eD54ae8700f23E24cB6316ddE8869978AB4d5f";
  //   const res = await connector.runOS({
  //     method: SYSTEM_CALL.isDatatokenCollectedBy,
  //     params: { dataTokenId, collector: address }
  //   });
  //   await isDatatokenCollectedBy({ dataTokenId, collector: address });
  //   console.log(res);
  // };

  // const loadDataUnions = async () => {
  //   const res = await connector.runOS({
  //     method: SYSTEM_CALL.loadDataUnions,
  //     params: [
  //       "0x6eeef1ffc904e0d3f20e6039dcf742cc1e9e2909e40f6a4aa5941f8426be086b"
  //     ]
  //   });
  //   console.log(res);
  // };

  // const isDataUnionCollectedBy = async () => {
  //   const dataUnionId =
  //     "0x6eeef1ffc904e0d3f20e6039dcf742cc1e9e2909e40f6a4aa5941f8426be086b";
  //   const res = await connector.runOS({
  //     method: SYSTEM_CALL.isDataUnionCollectedBy,
  //     params: {
  //       dataUnionId,
  //       collector: address
  //     }
  //   });
  //   console.log(res);
  // };

  // const isDataUnionSubscribedBy = async () => {
  //   const dataUnionId =
  //     "0x6eeef1ffc904e0d3f20e6039dcf742cc1e9e2909e40f6a4aa5941f8426be086b";
  //   const res = await connector.runOS({
  //     method: SYSTEM_CALL.isDataUnionSubscribedBy,
  //     params: {
  //       dataUnionId,
  //       subscriber: address,
  //       timestamp: 0
  //     }
  //   });
  //   console.log(res);
  // };

  /*** read operation */

  return (
    <div className='App'>
      <button onClick={() => createCapability()}>createCapability</button>
      <div className='blackText'>{pkh}</div>
      <hr />
      <button onClick={() => createPyraZone()}>createPyraZone</button>
      <button onClick={() => createTierkey()}>createTierkey</button>
      <button onClick={() => createTierkeyFile()}>createTierkeyFile</button>
      <button onClick={() => buyFile()}>collectFile</button>
      <button onClick={() => isBought()}>isCollected</button>
      <button onClick={() => sellFile()}>isFileUnlocked</button>
      <button onClick={() => unlockFile()}>unlockFile</button>
      <button onClick={() => isFileUnlocked()}>isFileUnlocked</button>
      <br />
      <br />
      {/* <button onClick={() => loadCreatedTokenFiles()}>
        loadCreatedTokenFiles
      </button>
      <button onClick={() => loadCollectedTokenFiles()}>
        loadCollectedTokenFiles
      </button> */}
      {/* <button onClick={loadDatatokens}>loadDatatokens</button>
      <button onClick={isDatatokenCollectedBy}>isDatatokenCollectedBy</button>
      <button onClick={isDatatokenSharedBy}>isDatatokenSharedBy</button>
      <br />
      <br />
      <button onClick={loadDataUnions}>loadDataUnions</button>
      <button onClick={isDataUnionCollectedBy}>isDataUnionCollectedBy</button>
      <button onClick={isDataUnionSubscribedBy}>isDataUnionSubscribedBy</button> */}
    </div>
  );
}

export default App;
