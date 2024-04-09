import { ChainId } from "../types";

export const DEPLOYED_ADDRESSES = {
  [ChainId.PolygonMumbai]: {
    PyraMarket: "0x6205F3D5afa741a64C6b99CeeD9fB5Fc45D40A2C",
    PyraZone: "0xe80111195F86B97717599D28E5B8bebFEdaf0AcA"
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
