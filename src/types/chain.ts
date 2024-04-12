import { BigNumberish } from "ethers";
import { RevenuePool } from "../abi/typechain/RevenuePool";
import { IPyraMarket } from "../abi/typechain/PyraMarket";

export enum ChainId {
  Polygon = 137,
  PolygonMumbai = 80001,
  Ethereum = 1,
  Base = 8453,
  BaseSepolia = 84532
}

export interface ZoneAsset {
  publishAt: BigNumberish;
  publicationId: BigNumberish;
  actions: string[];
  tierkeys: string[];
}

export enum TradeType {
  Buy,
  Sell
}

export type ShareInfo = IPyraMarket.ShareInfoStruct;

export type StakeStatus = RevenuePool.StakeStatusStruct;
