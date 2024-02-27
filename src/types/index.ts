import { BigNumberish } from "ethers";

export enum ChainId {
  // Polygon = 137,
  PolygonMumbai = 80001
}

export interface ZoneAsset {
  publishAt: BigNumberish;
  publicationId: BigNumberish;
  actions: BigNumberish[];
  tierkeys: BigNumberish[];
  expirations: BigNumberish[];
  totalValues: BigNumberish[];
}

export enum TradeType {
  Buy
}
