import React from "react";
import {
  Connector,
  SYSTEM_CALL,
  MeteorWalletProvider
} from "@meteor-web3/connector";
import { ethers } from "ethers";
import { PyraZone, PyraMarket, RevenuePool } from "../../src";
import "./App.scss";
import { ChainId } from "../../src/types";

const connector = new Connector(new MeteorWalletProvider());

export const appId = "9aaae63f-3445-47d5-8785-c23dd16e4965";

const postModelId =
  "kjzl6hvfrbw6c8h0oiiv2ccikb2thxsu98sy0ydi6oshj6sjuz9dga94463anvf";

const chainId = ChainId.PolygonMumbai;

const postVersion = "0.0.1";

let address: string;

let assetId: string;

let indexFileId: string;

let tierkey: string;

let keyId: string;

let shareContractAddress: string;

let revenuePoolContractAddress: string;

let rewards: number;

function App() {
  const [pkh, setPkh] = React.useState("");

  const createCapability = async () => {
    const connectWalletRes = await connector.connectWallet({
      provider: (window as any).ethereum
    });
    address = connectWalletRes.address;
    console.log(address);
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

  /*** PyraZone wirte operation */
  const createPyraZone = async () => {
    const pyraZone = new PyraZone({
      chainId,
      connector
    });

    assetId = await pyraZone.createPyraZone();
    console.log(assetId);
  };

  const createTierkey = async () => {
    const pyraZone = new PyraZone({
      chainId,
      assetId,
      connector
    });

    tierkey = await pyraZone.createTierkey(10);
    console.log(tierkey);
  };

  const createTierkeyFile = async () => {
    const pyraZone = new PyraZone({
      chainId,
      assetId,
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

  const buyTierkey = async () => {
    const pyraZone = new PyraZone({
      chainId,
      assetId,
      connector
    });

    keyId = await pyraZone.buyTierkey(tierkey);
    console.log("DataToken collected, keyId:", keyId);
    return keyId;
  };

  const isBought = async () => {
    const pyraZone = new PyraZone({
      chainId,
      assetId,
      connector
    });

    const res = await pyraZone!.isAccessible({ tierkey, account: address });
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

  const sellTierkey = async () => {
    const pyraZone = new PyraZone({
      chainId,
      assetId,
      connector
    });

    await pyraZone.sellTierkey({ tierkey, keyId });
    console.log("pyraZone sold");
  };

  /*** PyraZone wirte operation */

  /*** PyraZone read operation */
  /*** PyraZone read operation */

  /*** PyraMarket wirte operation */
  const createShare = async () => {
    const pyraMarket = new PyraMarket({
      chainId,
      connector
    });
    const res = await pyraMarket.createShare({
      shareName: "Test Share",
      shareSymbol: "TS",
      feePoint: 100
    });
    shareContractAddress = res.shareContractAddress;
    revenuePoolContractAddress = res.revenuePoolContractAddress;
    console.log({ shareContractAddress, revenuePoolContractAddress });
    return { shareContractAddress, revenuePoolContractAddress };
  };

  const buyShares = async () => {
    const pyraMarket = new PyraMarket({
      chainId,
      connector
    });
    await pyraMarket.buyShares({
      creator: address,
      amount: ethers.utils.parseEther("10")
    });
    console.log("Buy shares successfully");
  };

  const sellShares = async () => {
    const pyraMarket = new PyraMarket({
      chainId,
      connector
    });
    await pyraMarket.sellShares({
      creator: address,
      amount: ethers.utils.parseEther("1")
    });
    console.log("Sell shares successfully");
  };
  /*** PyraMarket wirte operation */

  /*** PyraMarket read operation */
  const getShareInfo = async () => {
    const pyraMarket = new PyraMarket({
      chainId,
      connector
    });
    const res = await pyraMarket.getShareInfo(address);
    console.log(res);
  };
  /*** PyraMarket read operation */

  /*** RevenuePool write operation */
  const stake = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      shareContractAddress,
      revenuePoolContractAddress,
      connector
    });
    await revenuePool.stake(ethers.utils.parseEther("1"));
    console.log("Stake successfully");
  };

  const unStake = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      shareContractAddress,
      revenuePoolContractAddress,
      connector
    });
    await revenuePool.unStake(ethers.utils.parseEther("1"));
    console.log("unStake successfully");
  };

  const claim = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      shareContractAddress,
      revenuePoolContractAddress,
      connector
    });
    rewards = await revenuePool.claim();
    console.log("Claim successfully");
  };

  const distribute = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      shareContractAddress,
      revenuePoolContractAddress,
      connector
    });
    await revenuePool.distribute(rewards);
    console.log("Distribute successfully");
  };
  /*** RevenuePool write operation */

  /*** RevenuePool read operation */
  /*** RevenuePool read operation */

  return (
    <div className='App'>
      <button onClick={() => createCapability()}>createCapability</button>
      <div className='blackText'>{pkh}</div>
      <hr />
      <button onClick={() => createPyraZone()}>createPyraZone</button>
      <button onClick={() => createTierkey()}>createTierkey</button>
      <button onClick={() => createTierkeyFile()}>createTierkeyFile</button>
      <button onClick={() => buyTierkey()}>buyTierkey</button>
      <button onClick={() => isBought()}>isBought</button>
      <button onClick={() => unlockFile()}>unlockFile</button>
      <button onClick={() => isFileUnlocked()}>isFileUnlocked</button>
      <button onClick={() => sellTierkey()}>sellTierkey</button>
      <br />
      <button onClick={() => createShare()}>createShare</button>
      <button onClick={() => buyShares()}>buyShares</button>
      <button onClick={() => sellShares()}>sellShares</button>
      <button onClick={() => getShareInfo()}>getShareInfo</button>
      <br />
      <button onClick={() => stake()}>stake</button>
      <button onClick={() => unStake()}>unStake</button>
      <button onClick={() => claim()}>claim</button>
      <button onClick={() => distribute()}>distribute</button>
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
