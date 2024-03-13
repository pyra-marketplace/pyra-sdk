import { ChainId } from "../types";

export const DEPLOYED_ADDRESSES = {
  [ChainId.PolygonMumbai]: {
    PyraMarket: "0x14a144575c4358D55434b179C1cAE6B2c6ff7655",
    PyraZone: "0x67804E153F9675E2173142B76f9fe949b2b20bDE"
  }
};

export const RPC = {
  [ChainId.Ethereum]: [
    "https://eth.llamarpc.com",
    "https://rpc.ankr.com/eth",
    "https://eth-mainnet.public.blastapi.io"
  ],
  [ChainId.Polygon]: [
    "https://polygon.llamarpc.com",
    "https://polygon.rpc.blxrbdn.com",
    "https://polygon-bor-rpc.publicnode.com"
  ],
  [ChainId.PolygonMumbai]: [
    "https://polygon-mumbai.blockpi.network/v1/rpc/public",
    "https://rpc.ankr.com/polygon_mumbai",
    "https://polygon-mumbai-bor-rpc.publicnode.com"
  ]
};
