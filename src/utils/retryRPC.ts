/* eslint-disable no-console */
import { ethers } from "ethers";
import { RPC } from "../configs";
import {
  PyraZone__factory,
  PyraMarket__factory,
  RevenuePool__factory,
  Tierkey__factory,
  Share__factory
} from "../abi/typechain";

export const ContractFactory = {
  pyraZone__factory: PyraZone__factory,
  pyraMarket__factory: PyraMarket__factory,
  revenuePool__factory: RevenuePool__factory,
  tierkey__factory: Tierkey__factory,
  share__factory: Share__factory
};

export async function retryRPC({
  chainId,
  contractFactory,
  contractAddress,
  method,
  params
}: {
  chainId: number;
  contractFactory?: keyof typeof ContractFactory;
  contractAddress?: string;
  method: any;
  params: any[];
}) {
  const rpcList = RPC[chainId as keyof typeof RPC];
  for (let i = 0; i < rpcList.length; i++) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(rpcList[i]);

      if (contractFactory && contractAddress) {
        const instance = ContractFactory[contractFactory].connect(
          contractAddress,
          provider
        );
        const res = await (instance as any)[method](...params);
        return res;
      } else {
        const res = (provider as any)[method](...params);
        return res;
      }
    } catch (e) {
      console.log(e);
    }
  }
  throw new Error("RPC error");
}
