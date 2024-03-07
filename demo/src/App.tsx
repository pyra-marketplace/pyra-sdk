import React from "react";
import {
  Connector,
  SYSTEM_CALL,
  MeteorWalletProvider
} from "@meteor-web3/connector";
import { BigNumberish, ethers } from "ethers";
import { PyraZone, PyraMarket, RevenuePool } from "../../src";
import "./App.scss";
import { ChainId } from "../../src/types";

const connector = new Connector(new MeteorWalletProvider());

export const appId = "9aaae63f-3445-47d5-8785-c23dd16e4965";

const postModelId =
  "kjzl6hvfrbw6c8h0oiiv2ccikb2thxsu98sy0ydi6oshj6sjuz9dga94463anvf";

const chainId = ChainId.PolygonMumbai;

const postVersion = "0.0.1";

let indexFileId: string;

let tierkeyId: string;

let shareContractAddress: string;

let revenuePoolContractAddress: string;

let rewards: number;

function App() {
  const [pkh, setPkh] = React.useState("");
  const [address, setAddress] = React.useState<string>();
  const [assetId, setAssetId] = React.useState<string>();
  const [tier, setTier] = React.useState(0);
  const [keyId, setKeyId] = React.useState<BigNumberish>(0);

  const createCapability = async () => {
    const connectWalletRes = await connector.connectWallet({
      provider: (window as any).ethereum
    });
    setAddress(connectWalletRes.address);
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
    if(!address) {
      throw new Error("Not connect wallet")
    }
    let _assetId: string;
    const pyraZones = await PyraZone.loadPyraZones({chainId, publishers: [address]});
    if(pyraZones.length > 0) {
      _assetId = pyraZones[0].asset_id;
    } else {
      const pyraZone = new PyraZone({
        chainId,
        connector,
      });
      _assetId = await pyraZone.createPyraZone();
    }
    setAssetId(_assetId)
    console.log(_assetId);
  };

  const createTierkey = async () => {
    const pyraZone = new PyraZone({
      chainId,
      assetId,
      connector
    });

    const res = await pyraZone.createTierkey(10);
    setTier(res.tier);
    tierkeyId = res.tierkeyId;
    console.log(res);
  };

  const createTierFile = async () => {
    const pyraZone = new PyraZone({
      chainId,
      assetId,
      connector
    });

    const date = new Date().toISOString();

    const res = await pyraZone.createTierFile({
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
      tierkeyId
    });
    indexFileId = res.fileContent.file.fileId;
    console.log(indexFileId);
  };

  const buyTierkey = async () => {
    const pyraZone = new PyraZone({
      chainId,
      assetId,
      connector
    });

    const keyId = await pyraZone.buyTierkey(tier);
    console.log(keyId);
    setKeyId(keyId)
    return keyId;
  };

  const isAccessible = async () => {
    if(!address) {
      throw new Error("Not connect wallet")
    }
    const pyraZone = new PyraZone({
      chainId,
      assetId,
      connector
    });

    const res = await pyraZone.isAccessible({ tier, account: address });
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
    console.log("keyId:", keyId)
    if(keyId === undefined) {
      console.error("key id is undefined")
      return
    }
    await pyraZone.sellTierkey({ tier, keyId });
    console.log("Sold tierkey successfully");
  };

  /*** PyraZone wirte operation */

  /*** PyraZone read operation */
  const loadPyraZones = async () => {
    if(!address) {
      throw new Error("Not connect wallet")
    }
    const res = await PyraZone.loadPyraZones({chainId, publishers: [address]});
    console.log("loadPyraZones:", res)
  }

  const loadPyraZoneTierkeyHolders = async () => {
    const res = await PyraZone.loadPyraZoneTierkeyHolders({chainId, assetId, tier})
    console.log("loadPyraZoneTierkeyHolders:", res)
  }

  const loadPyraZoneTierkeyActivities = async () => {
    const res = await PyraZone.loadPyraZoneTierkeyActivities({chainId, assetId, tier})
    console.log("loadPyraZoneTierkeyActivities:", res)
  }

  const loadFilesInPyraZone = async () => {
    if(!address) {
      throw new Error("Not connect wallet")
    }
    const pyraZone = new PyraZone({
      chainId,
      connector
    });
    const res = await pyraZone.loadFilesInPyraZone(assetId);
    console.log(res);
  };

  const loadFilesByTierkey = async () => {
    const pyraZone = new PyraZone({
      chainId,
      connector
    });
    const res = await pyraZone.loadFilesByTierkey(tierkeyId);
    console.log(res);
  };
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

  const getBuyPrice = async () => {
    if(!address) {
      throw new Error("Not connect wallet")
    }
    const pyraMarket = new PyraMarket({
      chainId,
      connector
    });
    const res = await pyraMarket.getBuyPrice({
      creator: address,
      amount: ethers.utils.parseEther("1")
    });
    console.log(ethers.utils.formatEther(res));
  };

  const buyShares = async () => {
    if(!address) {
      throw new Error("Not connect wallet")
    }
    const pyraMarket = new PyraMarket({
      chainId,
      connector
    });
    await pyraMarket.buyShares({
      creator: address,
      amount: ethers.utils.parseEther("1")
    });
    console.log("Bought shares successfully");
  };

  const getSellPrice = async () => {
    if(!address) {
      throw new Error("Not connect wallet")
    }
    const pyraMarket = new PyraMarket({
      chainId,
      connector
    });
    const res = await pyraMarket.getSellPrice({
      creator: address,
      amount: ethers.utils.parseEther("1")
    });
    console.log(ethers.utils.formatEther(res));
  };

  const sellShares = async () => {
    if(!address) {
      throw new Error("Not connect wallet")
    }
    const pyraMarket = new PyraMarket({
      chainId,
      connector
    });
    await pyraMarket.sellShares({
      creator: address,
      amount: ethers.utils.parseEther("1")
    });
    console.log("Sold shares successfully");
  };
  /*** PyraMarket wirte operation */

  /*** PyraMarket read operation */
  const loadPyraMarkets = async () => {
    if(!address) {
      throw new Error("Not connect wallet")
    }
    const res = await PyraMarket.loadPyraMarkets({chainId, publishers: [address]})
    console.log("loadPyraMarkets:", res)
  }

  const loadPyraMarketShareHolders = async () => {
    const res = await PyraMarket.loadPyraMarketShareHolders({chainId, publisher: address})
    console.log("loadPyraMarketShareHolders:", res)
  }

  const loadPyraMarketShareActivities = async () => {
    const res = await PyraMarket.loadPyraMarketShareActivities({chainId, publisher: address})
    console.log("loadPyraMarketShareActivities:", res)
  }

  const getShareInfo = async () => {
    if(!address) {
      throw new Error("Not connect wallet")
    }
    const pyraMarket = new PyraMarket({
      chainId,
      connector
    });
    const res = await pyraMarket.getShareInfo(address);
    shareContractAddress = res.share;
    revenuePoolContractAddress = res.revenuePool;
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
    console.log("Staked successfully");
  };

  const unStake = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      shareContractAddress,
      revenuePoolContractAddress,
      connector
    });
    await revenuePool.unStake(ethers.utils.parseEther("1"));
    console.log("unStaked successfully");
  };

  const claim = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      shareContractAddress,
      revenuePoolContractAddress,
      connector
    });
    rewards = await revenuePool.claim();
    console.log("Claimed successfully, rewards: ", rewards);
  };

  const distribute = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      shareContractAddress,
      revenuePoolContractAddress,
      connector
    });
    await revenuePool.distribute(rewards);
    console.log("Distributed successfully");
  };
  /*** RevenuePool write operation */

  /*** RevenuePool read operation */
  const getTotalSupply = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      revenuePoolContractAddress,
      connector
    });
    const totalSupply = await revenuePool.getTotalSupply();
    console.log(ethers.utils.formatEther(totalSupply));
  };

  const getRevenuePoolBalance = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      revenuePoolContractAddress,
      connector
    });
    const revenuePoolBalance = await revenuePool.getRevenuePoolBalance();
    console.log(ethers.utils.formatEther(revenuePoolBalance));
  };

  const getStakingRewards = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      revenuePoolContractAddress,
      connector
    });
    const rewards = await revenuePool.getStakingRewards();
    console.log(ethers.utils.formatEther(rewards));
  };

  const calculateRevenue = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      revenuePoolContractAddress,
      connector
    });
    const revenue = await revenuePool.calculateRevenue();
    console.log(ethers.utils.formatEther(revenue));
  };
  /*** RevenuePool read operation */

  return (
    <div className='App'>
      <button onClick={() => createCapability()}>createCapability</button>
      <div className='blackText'>{pkh}</div>
      <hr />
      <button onClick={() => createPyraZone()}>createPyraZone</button>
      <button onClick={() => createTierkey()}>createTierkey</button>
      <button onClick={() => createTierFile()}>createTierkeyFile</button>
      <button onClick={() => buyTierkey()}>buyTierkey</button>
      <button onClick={() => isAccessible()}>isBought</button>
      <button onClick={() => unlockFile()}>unlockFile</button>
      <button onClick={() => isFileUnlocked()}>isFileUnlocked</button>
      <button onClick={() => sellTierkey()}>sellTierkey</button>
      <button onClick={() => loadPyraZones()}>loadPyraZones</button>
      <button onClick={() => loadPyraZoneTierkeyHolders()}>loadPyraZoneTierkeyHolders</button>
      <button onClick={() => loadPyraZoneTierkeyActivities()}>loadPyraZoneTierkeyActivities</button>
      <button onClick={() => loadFilesInPyraZone()}>loadFilesInPyraZone</button>
      <button onClick={() => loadFilesByTierkey()}>loadFilesByTierkey</button>
      <br />
      <button onClick={() => loadPyraMarkets()}>loadPyraMarkets</button>
      <button onClick={() => loadPyraMarketShareHolders()}>loadPyraMarketShareHolders</button>
      <button onClick={() => loadPyraMarketShareActivities()}>loadPyraMarketShareActivities</button>
      <button onClick={() => createShare()}>createShare</button>
      <button onClick={() => buyShares()}>buyShares</button>
      <button onClick={() => getBuyPrice()}>getBuyPrice</button>
      <button onClick={() => sellShares()}>sellShares</button>
      <button onClick={() => getSellPrice()}>getSellPrice</button>
      <button onClick={() => getShareInfo()}>getShareInfo</button>
      <br />
      <button onClick={() => stake()}>stake</button>
      <button onClick={() => unStake()}>unStake</button>
      <button onClick={() => claim()}>claim</button>
      <button onClick={() => distribute()}>distribute</button>
      <button onClick={() => getTotalSupply()}>getTotalSupply</button>
      <button onClick={() => getRevenuePoolBalance()}>
        getRevenuePoolBalance
      </button>
      <button onClick={() => getStakingRewards()}>getStakingRewards</button>
      <button onClick={() => calculateRevenue()}>calculateRevenue</button>
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
