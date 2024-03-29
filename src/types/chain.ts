import { BigNumberish } from "ethers";
import {RevenuePool} from "../abi/typechain/RevenuePool";

export enum ChainId {
  Polygon = 137,
  PolygonMumbai = 80001,
  Ethereum = 1
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

export type StakeStatus = RevenuePool.StakeStatusStruct;