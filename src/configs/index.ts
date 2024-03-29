import { ChainId } from "../types";

export const DEPLOYED_ADDRESSES = {
  [ChainId.PolygonMumbai]: {
    PyraMarket: "0x8E9C0F71B2049e2BE2576A2f37C15c237281ECd8",
    PyraZone: "0x152CdeAE4804075D76e7aAdb0A7216D13687a738"
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
