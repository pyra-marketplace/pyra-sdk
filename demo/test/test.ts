/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataverseKernel } from "@dataverse/dataverse-kernel";
import {
  Connector,
  SYSTEM_CALL,
  MeteorLocalProvider
} from "@meteor-web3/connector";
import { BigNumberish, ethers } from "ethers";
import { PyraZone, PyraMarket, RevenuePool } from "../../src";
import { ChainId } from "../../src/types";

const chainId = ChainId.BaseSepolia;

const appId = "9aaae63f-3445-47d5-8785-c23dd16e4965";

const postModelId =
  "kjzl6hvfrbw6c8h0oiiv2ccikb2thxsu98sy0ydi6oshj6sjuz9dga94463anvf";

const postVersion = "0.0.1";

const testPK = "";

let folderId: string;
let indexFileId: string;
let shareAddress: string;
let revenuePoolAddress: string;
let address: string;
let pkh: string = "";
let assetId: string = "";
let tier: number = 0;
let keyId: BigNumberish = 0;
let connector: Connector;

const setAddress = (addr: string) => (address = addr);
const setPkh = (pk: string) => (pkh = pk);
const setAssetId = (asset: string) => (assetId = asset);
const setTier = (t: number) => (tier = t);
const setKeyId = (k: BigNumberish) => (keyId = k);

const createCapability = async () => {
  const connectWalletRes = await connector.connectWallet();
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

const updatePublisherProfile = async () => {
  if (!address) {
    throw new Error("need conenct wallet");
  }
  const res = await PyraMarket.updatePublisherProfile({
    publisher: address,
    nickName: "Default Nick",
    coverImageUrl:
      "https://cdn.vox-cdn.com/thumbor/9eUdMkl-i0seN4eBv4ahbeE9TtQ=/0x0:1920x1080/1200x800/filters:focal(807x387:1113x693)/cdn.vox-cdn.com/uploads/chorus_image/image/60956053/Sekiro_24.0.jpg",
    connector
  });

  console.log("update profile:", res);
};

const loadPublisherProfile = async () => {
  if (!address) {
    throw new Error("need conenct wallet");
  }
  const res = await PyraMarket.loadPublisherProfile(address);

  console.log("update profile:", res);
};

const createShare = async () => {
  const pyraMarket = new PyraMarket({
    chainId,
    connector
  });
  const res = await pyraMarket.createShare({
    shareName: "Canvas Share",
    shareSymbol: "CAVS"
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

const loadPyraMarketShareHolderPortfolios = async () => {
  if (!address) {
    throw new Error("Not connect wallet");
  }
  const res = await PyraMarket.loadPyraMarketShareHolderPortfolios({
    chainId,
    shareholder: address,
    orderBy: "shares_price",
    orderType: "desc"
  });
  console.log("loadPyraMarketShareHolderPortfolios:", res);
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
    `Skim ${ethers.utils.formatEther(skimAmount)} to revenue pool successfully`
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

const loadPyraZoneTierkeyHolderPortfolios = async () => {
  if (!address) {
    throw new Error("Not connect wallet");
  }
  const res = await PyraZone.loadPyraZoneTierkeyHolderPortfolios({
    chainId,
    tierkeyHolder: address,
    orderBy: "tierkeys_price",
    orderType: "desc"
  });
  console.log("loadPyraZoneTierkeyHolderPortfolios:", res);
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

const loadFoldersInPyraZone = async () => {
  const pyraZone = new PyraZone({
    chainId,
    connector
  });
  const folderRecord = await pyraZone.loadFoldersInPyraZone(assetId);
  folderId = Object.values(folderRecord)?.[0]?.folderId;
  console.log(folderRecord);
};

const loadFolderByTier = async () => {
  const pyraZone = new PyraZone({
    chainId,
    connector,
    assetId
  });
  const res = await pyraZone.loadFolderByTier(tier);
  console.log(res);
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

async function localTest() {
  await DataverseKernel.runNodeKernel();
  connector = new Connector(new MeteorLocalProvider(testPK));
  // test load operations
  const pkh = await createCapability();
  console.log({ pkh });
  await loadPyraZones();
  await loadPyraMarkets();
  // test write operations
  await createShare();
  await createPyraZone();
  await createTierkey();
  await createTierFile();
}

localTest();
