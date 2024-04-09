import { ethers } from "ethers";
import { PyraZone__factory } from "../src/abi/typechain";

async function main() {
  const pk = "";
  const assetContract = "0x152CdeAE4804075D76e7aAdb0A7216D13687a738";
  const provider = new ethers.providers.JsonRpcProvider(
    "https://polygon-mumbai.blockpi.network/v1/rpc/public"
  );
  const walletWithProvider = new ethers.Wallet(pk, provider);
  const pyraZone = PyraZone__factory.connect(assetContract, walletWithProvider);
  const assetId =
    "0x9e690b913bf2a6da7d6993d0a0a1bcbcf0eb4715fd7f41e55cf6c9c0c1fa348e";
  const tier = 0;
  const totalPrice = await pyraZone.getTierkeyPriceAfterFee(assetId, tier, 0);
  const res = await pyraZone.buyTierkey(assetId, tier, {
    value: totalPrice,
    // gasPrice: 2000,
    // gasLimit: 30000
  });
  console.log(res);
}

main();
