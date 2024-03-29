import { ChainId } from "../types";

export const DEPLOYED_ADDRESSES = {
  [ChainId.PolygonMumbai]: {
    PyraMarket: "0x3868fB88F88E8eF70BEf8fC5dff98240919C4661",
    PyraZone: "0xA3a487910b826042e85C920f264DC772c0d9D5C2"
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
