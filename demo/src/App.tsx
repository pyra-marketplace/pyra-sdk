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

const appId = "e104c799-3cb6-4f4d-ba8a-16649cd9701a";

const postModelId =
  "kjzl6hvfrbw6c8nivefcu4rozay0y3rzm8pomdsxl4abfc3n1rokft2m04flbd4";

const chainId = ChainId.PolygonMumbai;

const postVersion = "0.0.1";

let folderId: string;

let indexFileId: string;

let shareAddress: string;

let revenuePoolAddress: string;

let rewards: number;

function App() {
  const [pkh, setPkh] = React.useState("");
  const [address, setAddress] = React.useState<string>();
  const [assetId, setAssetId] = React.useState<string>("");
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
    if (!address) {
      throw new Error("Not connect wallet");
    }
    let _assetId: string;
    const pyraZones = await PyraZone.loadPyraZones({
      chainId,
      publishers: [address]
    });
    if (pyraZones.length > 0) {
      _assetId = pyraZones[0].asset_id;
    } else {
      const pyraZone = new PyraZone({
        chainId,
        connector
      });
      _assetId = await pyraZone.createPyraZone();
    }
    setAssetId(_assetId);
    console.log(_assetId);
  };

  const createTierkey = async () => {
    const pyraZone = new PyraZone({
      chainId,
      assetId,
      connector
    });

    const res = await pyraZone.createTierkey(60 * 60 * 24 * 30);
    setTier(res.tier);
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
        title: "test title",
        description: "test description",
        tags: ["test tag1", "test tag2"],
        resources: [
          "https://bafkreib76wz6wewtkfmp5rhm3ep6tf4xjixvzzyh64nbyge5yhjno24yl4.ipfs.w3s.link"
        ],
        createdAt: date,
        updatedAt: date,
        encrypted: JSON.stringify({
          resources: true
        })
      },
      tier
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
    setKeyId(keyId);
    return keyId;
  };

  const isAccessible = async () => {
    if (!address) {
      throw new Error("Not connect wallet");
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

  const sellTierkey = async () => {
    const pyraZone = new PyraZone({
      chainId,
      assetId,
      connector
    });
    console.log("keyId:", keyId);
    if (keyId === undefined) {
      console.error("key id is undefined");
      return;
    }
    await pyraZone.sellTierkey({ tier, keyId });
    console.log("Sold tierkey successfully");
  };

  /*** PyraZone wirte operation */

  /*** PyraZone read operation */
  const loadZoneAsset = async () => {
    if (!address) {
      throw new Error("Not connect wallet");
    }
    const pyraZone = new PyraZone({
      chainId,
      assetId,
      connector
    });
    const res = await pyraZone.loadZoneAsset();
    console.log("loadPyraZones:", res);
  };

  const loadPyraZones = async () => {
    if (!address) {
      throw new Error("Not connect wallet");
    }
    const res = await PyraZone.loadPyraZones({
      chainId,
      publishers: [address]
    });
    if (res.length > 0) {
      setAssetId(res[0].asset_id);
    }
    console.log("loadPyraZones:", res);
  };

  const loadTrendingPyraZones = async () => {
    const ONE_WEEK = 3500 * 24 * 7;
    const res = await PyraZone.loadPyraZones({
      chainId,
      recentTime: ONE_WEEK
    });
    console.log("loadTrendingPyraZones:", res);
  };

  const loadPyraZoneTierkeyHolders = async () => {
    const res = await PyraZone.loadPyraZoneTierkeyHolders({
      chainId,
      assetId,
      tier
    });
    console.log("loadPyraZoneTierkeyHolders:", res);
  };

  const loadPyraZoneTierkeyActivities = async () => {
    const res = await PyraZone.loadPyraZoneTierkeyActivities({
      chainId,
      assetId,
      tier
    });
    console.log("loadPyraZoneTierkeyActivities:", res);
  };

  const loadTierKeyBuyPrice = async () => {
    const pyraZone = new PyraZone({
      chainId,
      assetId,
      connector
    });

    const res = await pyraZone.loadBuyPrice(tier);
    console.log(ethers.utils.formatEther(res));
  };

  const loadTierKeySellPrice = async () => {
    const pyraZone = new PyraZone({
      chainId,
      assetId,
      connector
    });

    const res = await pyraZone.loadSellPrice(tier);
    console.log(ethers.utils.formatEther(res));
  };

  const loadFilesInPyraZone = async () => {
    const pyraZone = new PyraZone({
      chainId,
      connector
    });
    const res = await pyraZone.loadFilesInPyraZone(assetId);
    console.log(res);
  };

  const loadFilesByTier = async () => {
    const pyraZone = new PyraZone({
      chainId,
      connector
    });
    const res = await pyraZone.loadFilesByTier(tier);
    console.log(res);
  };

  const loadFilesByPkh = async () => {
    const pyraZone = new PyraZone({
      chainId,
      connector
    });
    const res = await pyraZone.loadFilesByPkh({ modelId: postModelId, pkh });
    console.log(res);
  };

  const unlockFile = async () => {
    const pyraZone = new PyraZone({
      chainId,
      connector
    });
    const res = await pyraZone.unlockFile(indexFileId);
    console.log(res);
  };

  const loadFolderInPyraZone = async () => {
    const pyraZone = new PyraZone({
      chainId,
      connector
    });
    const folder = await pyraZone.loadFolderInPyraZone(assetId);
    folderId = folder?.folderId;
    console.log(folder);
  };

  const unlockFolder = async () => {
    const pyraZone = new PyraZone({
      chainId,
      connector
    });
    const res = await pyraZone.unlockFolder(folderId);
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
    shareAddress = res.shareAddress;
    revenuePoolAddress = res.revenuePoolAddress;
    console.log({ shareAddress, revenuePoolAddress });
    return { shareAddress, revenuePoolAddress };
  };

  const buyShares = async () => {
    if (!address) {
      throw new Error("Not connect wallet");
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

  const sellShares = async () => {
    if (!address) {
      throw new Error("Not connect wallet");
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
    if (!address) {
      throw new Error("Not connect wallet");
    }
    let res = await PyraMarket.loadPyraMarkets({
      chainId,
      publishers: [address]
    });

    res = res.map((item) => ({
      ...item,
      total_value: ethers.utils.formatEther(item.total_value)
    }));

    shareAddress = res[0]?.share;

    console.log("loadPyraMarkets:", res);
  };

  const loadPyraMarketShareHolders = async () => {
    const res = await PyraMarket.loadPyraMarketShareHolders({
      chainId,
      publisher: address,
      orderBy: "total_amount",
      orderType: "desc",
      page: 1,
      pageSize: 10
    });
    console.log("loadPyraMarketShareHolders:", res);
  };

  const loadPyraMarketShareActivities = async () => {
    let res = await PyraMarket.loadPyraMarketShareActivities({
      chainId,
      publisher: address,
      orderBy: "block_number",
      orderType: "desc",
      page: 1,
      pageSize: 10
    });
    res = res.map((item) => ({
      ...item,
      ...(item.buy_amount && {
        buy_amount: ethers.utils.formatEther(item.buy_amount)
      }),
      ...(item.buy_price && {
        buy_price: ethers.utils.formatEther(item.buy_price)
      }),
      ...(item.sell_amount && {
        sell_amount: ethers.utils.formatEther(item.sell_amount)
      }),
      ...(item.sell_price && {
        sell_amount: ethers.utils.formatEther(item.sell_price)
      })
    }));
    console.log("loadPyraMarketShareActivities:", res);
  };

  const loadShareInfo = async () => {
    if (!address) {
      throw new Error("Not connect wallet");
    }
    const pyraMarket = new PyraMarket({
      chainId,
      connector
    });
    const res = await pyraMarket.loadShareInfo(address);
    shareAddress = res.shareAddress;
    revenuePoolAddress = res.revenuePool;
    console.log(res);
  };

  const loadShareTotalSupply = async () => {
    if (!address) {
      throw new Error("Not connect wallet");
    }
    const pyraMarket = new PyraMarket({
      chainId,
      connector
    });
    const totalSupply = await pyraMarket.loadTotalSupply(shareAddress);
    console.log(ethers.utils.formatEther(totalSupply));
  };

  const loadShareBuyPrice = async () => {
    if (!address) {
      throw new Error("Not connect wallet");
    }
    const pyraMarket = new PyraMarket({
      chainId,
      connector
    });
    const res = await pyraMarket.loadBuyPrice({
      creator: address,
      amount: ethers.utils.parseEther("1")
    });
    console.log(ethers.utils.formatEther(res));
  };

  const loadShareSellPrice = async () => {
    if (!address) {
      throw new Error("Not connect wallet");
    }
    const pyraMarket = new PyraMarket({
      chainId,
      connector
    });
    const res = await pyraMarket.loadSellPrice({
      creator: address,
      amount: ethers.utils.parseEther("1")
    });
    console.log(ethers.utils.formatEther(res));
  };
  /*** PyraMarket read operation */

  /*** RevenuePool write operation */
  const stake = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      shareAddress,
      revenuePoolAddress,
      connector
    });
    await revenuePool.stake(ethers.utils.parseEther("1"));
    console.log("Staked successfully");
  };

  const unStake = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      shareAddress,
      revenuePoolAddress,
      connector
    });
    await revenuePool.unStake(ethers.utils.parseEther("1"));
    console.log("unStaked successfully");
  };

  const claim = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      shareAddress,
      revenuePoolAddress,
      connector
    });
    rewards = await revenuePool.claim();
    console.log("Claimed successfully, rewards: ", rewards);
  };

  const distribute = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      shareAddress,
      revenuePoolAddress,
      connector
    });
    await revenuePool.distribute(rewards);
    console.log("Distributed successfully");
  };
  /*** RevenuePool write operation */

  /*** RevenuePool read operation */
  // const getRevenuePoolTotalSupply = async () => {
  //   const revenuePool = new RevenuePool({
  //     chainId,
  //     revenuePoolAddress,
  //     connector
  //   });
  //   const totalSupply = await revenuePool.getTotalSupply();
  //   console.log(ethers.utils.formatEther(totalSupply));
  // };

  const getRevenuePoolBalance = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      revenuePoolAddress,
      connector
    });
    const revenuePoolBalance = await revenuePool.getRevenuePoolBalance();
    console.log(ethers.utils.formatEther(revenuePoolBalance));
  };

  const getStakingRewards = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      revenuePoolAddress,
      connector
    });
    const rewards = await revenuePool.getStakingRewards();
    console.log(ethers.utils.formatEther(rewards));
  };

  // const calculateRevenue = async () => {
  //   const revenuePool = new RevenuePool({
  //     chainId,
  //     revenuePoolAddress,
  //     connector
  //   });
  //   const revenue = await revenuePool.calculateRevenue();
  //   console.log(ethers.utils.formatEther(revenue));
  // };
  /*** RevenuePool read operation */

  return (
    <div className='App'>
      <button onClick={() => createCapability()}>createCapability</button>
      <div className='blackText'>{pkh}</div>
      <hr />
      <button onClick={() => createPyraZone()}>createPyraZone</button>
      <button onClick={() => createTierkey()}>createTierkey</button>
      <button onClick={() => createTierFile()}>createTierFile</button>
      <button onClick={() => buyTierkey()}>buyTierkey</button>
      <button onClick={() => isAccessible()}>isAccessible</button>

      <button onClick={() => sellTierkey()}>sellTierkey</button>
      <button onClick={() => loadZoneAsset()}>loadZoneAsset</button>
      <button onClick={() => loadPyraZones()}>loadPyraZones</button>
      <button onClick={() => loadTrendingPyraZones()}>
        loadTrendingPyraZones
      </button>
      <button onClick={() => loadPyraZoneTierkeyHolders()}>
        loadPyraZoneTierkeyHolders
      </button>
      <button onClick={() => loadPyraZoneTierkeyActivities()}>
        loadPyraZoneTierkeyActivities
      </button>
      <button onClick={() => loadTierKeyBuyPrice()}>loadTierKeyBuyPrice</button>
      <button onClick={() => loadTierKeySellPrice()}>
        loadTierKeySellPrice
      </button>
      <button onClick={() => loadFolderInPyraZone()}>
        loadFolderInPyraZone
      </button>
      <button onClick={() => loadFilesInPyraZone()}>loadFilesInPyraZone</button>
      <button onClick={() => unlockFolder()}>unlockFolder</button>
      <button onClick={() => unlockFile()}>unlockFile</button>
      <button onClick={() => loadFilesByTier()}>loadFilesByTier</button>
      <button onClick={() => loadFilesByPkh()}>loadFilesByPkh</button>
      <br />
      <button onClick={() => loadPyraMarkets()}>loadPyraMarkets</button>
      <button onClick={() => loadPyraMarketShareHolders()}>
        loadPyraMarketShareHolders
      </button>
      <button onClick={() => loadPyraMarketShareActivities()}>
        loadPyraMarketShareActivities
      </button>
      <button onClick={() => createShare()}>createShare</button>
      <button onClick={() => buyShares()}>buyShares</button>
      <button onClick={() => sellShares()}>sellShares</button>
      <button onClick={() => loadShareInfo()}>loadShareInfo</button>
      <button onClick={() => loadShareTotalSupply()}>
        loadShareTotalSupply
      </button>
      <button onClick={() => loadShareBuyPrice()}>loadShareBuyPrice</button>
      <button onClick={() => loadShareSellPrice()}>loadShareSellPrice</button>
      <br />
      <button onClick={() => stake()}>stake</button>
      <button onClick={() => unStake()}>unStake</button>
      <button onClick={() => claim()}>claim</button>
      <button onClick={() => distribute()}>distribute</button>
      {/* <button onClick={() => getTotalSupply()}>getTotalSupply</button> */}
      <button onClick={() => getRevenuePoolBalance()}>
        getRevenuePoolBalance
      </button>
      <button onClick={() => getStakingRewards()}>getStakingRewards</button>
      {/* <button onClick={() => calculateRevenue()}>calculateRevenue</button> */}
      <br />
    </div>
  );
}

export default App;
