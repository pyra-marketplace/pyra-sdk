import React, { useEffect } from "react";
import {
  Connector,
  SYSTEM_CALL,
  MeteorWebProvider
} from "@meteor-web3/connector";
import { BigNumberish, ethers } from "ethers";
import { PyraZone, PyraMarket, RevenuePool, Auth } from "../../src";
import "./App.scss";
import { ChainId } from "../../src/types";

const connector = new Connector(new MeteorWebProvider());

const appId = "e104c799-3cb6-4f4d-ba8a-16649cd9701a";

const postModelId =
  "kjzl6hvfrbw6c8nivefcu4rozay0y3rzm8pomdsxl4abfc3n1rokft2m04flbd4";

const chainId = ChainId.PolygonMumbai;

const postVersion = "0.0.1";

let folderId: string;

let indexFileId: string;

let shareAddress: string;

let revenuePoolAddress: string;

function App() {
  const [pkh, setPkh] = React.useState("");
  const [address, setAddress] = React.useState<string>();
  const [assetId, setAssetId] = React.useState<string>("");
  const [tier, setTier] = React.useState(0);
  const [keyId, setKeyId] = React.useState<BigNumberish>(0);
  const [code, setCode] = React.useState<string | null>();
  const [state, setState] = React.useState<string | null>();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    setCode(searchParams.get("code"));
    setState(searchParams.get("state"));
    if (code && state) {
      const uri = new URL(window.location.href);
      uri.searchParams.delete("code");
      uri.searchParams.delete("state");
      window.history.pushState({}, "", uri);
    }
  }, []);

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

  /*** Auth */
  const login = async () => {
    const res = await Auth.login({
      connector,
      redirectUrl: location.href
    });
    console.log(res);
    window.location.href = res.url;
  };

  const bind = async () => {
    console.log({ code });
    if (!code) {
      throw new Error("no code");
    }
    if (!state) {
      throw new Error("no state");
    }
    const res = await Auth.bind({
      code,
      state
    });
    console.log(res);
  };

  const info = async () => {
    const res = await Auth.info({
      address
      // twitterId: "1751701503788695552"
    });
    console.log(res);
  };
  /*** Auth */

  /*** PyraMarket wirte operation */
  const watch = async () => {
    if (!address) {
      throw new Error("need conenct wallet");
    }
    const res = await PyraMarket.watch({
      watcher: address,
      publisher: "0xD0167B1cc6CAb1e4e7C6f38d09EA35171d00b68e",
      connector
    });
    console.log("watch success:", res);
  };

  const unwatch = async () => {
    if (!address) {
      throw new Error("need conenct wallet");
    }
    const res = await PyraMarket.unwatch({
      chainId,
      watcher: address,
      publisher: "0xD0167B1cc6CAb1e4e7C6f38d09EA35171d00b68e",
      connector
    });
    console.log("unwatch success:", res);
  };

  const loadWatchlist = async () => {
    if (!address) {
      throw new Error("need conenct wallet");
    }
    const res = await PyraMarket.loadWatchlist({
      watcher: address,
      page: 1,
      pageSize: 10,
      orderBy: "watch_at",
      orderType: "desc"
    });
    console.log("watchlist:", res);
  };

  const createShare = async () => {
    const pyraMarket = new PyraMarket({
      chainId,
      connector
    });
    const res = await pyraMarket.createShare({
      shareName: "Test Share",
      shareSymbol: "TS"
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
    revenuePoolAddress = res[0]?.revenue_pool;

    console.log("loadPyraMarkets:", res);
  };

  const loadTrendingPyraMarkets = async () => {
    let res = await PyraMarket.loadTrendingPyraMarkets({
      chainId
    });

    res = res.map((item) => ({
      ...item,
      total_value: ethers.utils.formatEther(item.total_value)
    }));

    console.log("loadTrendingPyraMarkets:", res);
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
        sell_price: ethers.utils.formatEther(item.sell_price)
      })
    }));
    console.log("loadPyraMarketShareActivities:", res);
  };

  const loadPublisherDailyRecordChart = async () => {
    if (!chainId) {
      throw new Error("chain id must be pass");
    }
    if (!address) {
      throw new Error("Not connect wallet");
    }
    const res = await PyraMarket.loadPublisherDailyRecordChart({
      chainId,
      publisher: address,
      days: 10
    });

    console.log("chart res:", res);
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
    shareAddress = res.share;
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

  const loadShareBalance = async () => {
    if (!address) {
      throw new Error("Not connect wallet");
    }
    const pyraMarket = new PyraMarket({
      chainId,
      connector
    });
    const res = await pyraMarket.loadShareBalance({
      shareAddress,
      address
    });
    console.log(ethers.utils.formatEther(res));
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
    console.log("Staked 1 ether successfully");
  };

  const unstake = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      shareAddress,
      revenuePoolAddress,
      connector
    });
    await revenuePool.unstake(ethers.utils.parseEther("1"));
    console.log("Unstaked 1 ether successfully");
  };

  const claim = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      shareAddress,
      revenuePoolAddress,
      connector
    });
    const revenue = await revenuePool.claim();
    console.log("(RAW)Claimed revenue: ", revenue);
    console.log("(Ether)Claimed revenue: ", ethers.utils.formatEther(revenue));
  };
  /*** RevenuePool write operation */

  /*** RevenuePool read operation */
  const loadRevenuePoolBalance = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      revenuePoolAddress,
      connector
    });
    const revenuePoolBalance = await revenuePool.loadRevenuePoolBalance();
    console.log("(RAW)Revenue pool balance:", revenuePoolBalance.toString());
    console.log(
      "(Ether)Revenue pool balance:",
      ethers.utils.formatEther(revenuePoolBalance)
    );
  };

  const loadClaimableRevenue = async () => {
    const revenuePool = new RevenuePool({
      chainId,
      revenuePoolAddress,
      connector
    });
    const revenue = await revenuePool.loadClaimableRevenue();
    console.log("(RAW)Claimable revenue:", revenue.toString());
    console.log("(Ether)Claimable revenue:", ethers.utils.formatEther(revenue));
  };

  const loadRevenuePoolActivities = async () => {
    const activities = await RevenuePool.loadRevenuePoolActivities({
      chainId
    });
    console.log(activities);
  };
  /*** RevenuePool read operation */

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

    const res = await pyraZone.createTierkey();
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

  const skim = async () => {
    const pyraZone = new PyraZone({
      chainId,
      assetId,
      connector
    });

    const skimAmount = await pyraZone.skim();
    console.log(
      `Skim ${ethers.utils.formatEther(
        skimAmount
      )} to revenue pool successfully`
    );
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
    const res = await PyraZone.loadTrendingPyraZones({
      chainId
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

  const loadTierkeyBalance = async () => {
    const pyraZone = new PyraZone({
      chainId,
      assetId,
      connector
    });

    const res = await pyraZone.loadTierkeyBalance({
      tier: 0,
      address: address!
    });
    console.log(res.toNumber());
  };

  const loadTierkeyBuyPrice = async () => {
    const pyraZone = new PyraZone({
      chainId,
      assetId,
      connector
    });

    const res = await pyraZone.loadBuyPrice(tier);
    console.log(ethers.utils.formatEther(res));
  };

  const loadTierkeySellPrice = async () => {
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

  return (
    <div className='App'>
      <button onClick={() => createCapability()}>createCapability</button>
      <div className='blackText'>{pkh}</div>
      <hr />
      <button onClick={() => login()}>login</button>
      <button onClick={() => bind()}>bind</button>
      <button onClick={() => info()}>info</button>
      <br />
      <button onClick={() => loadPyraMarkets()}>loadPyraMarkets</button>
      <button onClick={loadTrendingPyraMarkets}>loadTrendingPyraMarkets</button>
      <button onClick={() => loadPyraMarketShareHolders()}>
        loadPyraMarketShareHolders
      </button>
      <button onClick={() => loadPyraMarketShareActivities()}>
        loadPyraMarketShareActivities
      </button>
      <button onClick={loadPublisherDailyRecordChart}>
        loadPublisherDailyRecordChart
      </button>
      <button onClick={watch}>watch</button>
      <button onClick={unwatch}>unwatch</button>
      <button onClick={loadWatchlist}>loadWatchlist</button>
      <button onClick={() => createShare()}>createShare</button>
      <button onClick={() => buyShares()}>buyShares</button>
      <button onClick={() => sellShares()}>sellShares</button>
      <button onClick={() => loadShareInfo()}>loadShareInfo</button>
      <button onClick={() => loadShareTotalSupply()}>
        loadShareTotalSupply
      </button>
      <button onClick={() => loadShareBalance()}>loadShareBalance</button>
      <button onClick={() => loadShareBuyPrice()}>loadShareBuyPrice</button>
      <button onClick={() => loadShareSellPrice()}>loadShareSellPrice</button>
      <br />
      <button onClick={() => stake()}>stake</button>
      <button onClick={() => unstake()}>unstake</button>
      <button onClick={() => claim()}>claim</button>
      <button onClick={() => loadRevenuePoolBalance()}>
        loadRevenuePoolBalance
      </button>
      <button onClick={() => loadClaimableRevenue()}>
        loadClaimableRevenue
      </button>
      <button onClick={loadRevenuePoolActivities}>
        loadRevenuePoolActivities
      </button>
      <br />
      <button onClick={() => createPyraZone()}>createPyraZone</button>
      <button onClick={() => createTierkey()}>createTierkey</button>
      <button onClick={() => createTierFile()}>createTierFile</button>
      <button onClick={() => buyTierkey()}>buyTierkey</button>
      <button onClick={() => sellTierkey()}>sellTierkey</button>
      <button onClick={() => skim()}>skim</button>
      <button onClick={() => isAccessible()}>isAccessible</button>
      <button onClick={() => loadZoneAsset()}>loadZoneAsset</button>
      <button onClick={() => loadPyraZones()}>loadPyraZones</button>
      <button onClick={loadTrendingPyraZones}>loadTrendingPyraZones</button>
      <button onClick={() => loadPyraZoneTierkeyHolders()}>
        loadPyraZoneTierkeyHolders
      </button>
      <button onClick={() => loadPyraZoneTierkeyActivities()}>
        loadPyraZoneTierkeyActivities
      </button>
      <button onClick={() => loadTierkeyBalance()}>loadTierkeyBalance</button>
      <button onClick={() => loadTierkeyBuyPrice()}>loadTierkeyBuyPrice</button>
      <button onClick={() => loadTierkeySellPrice()}>
        loadTierkeySellPrice
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
    </div>
  );
}

export default App;
