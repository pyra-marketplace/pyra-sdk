/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "./common";

export declare namespace PyraMarket {
  export type ShareInfoStruct = {
    share: string;
    revenuePool: string;
    feePoint: BigNumberish;
    totalValue: BigNumberish;
  };

  export type ShareInfoStructOutput = [string, string, BigNumber, BigNumber] & {
    share: string;
    revenuePool: string;
    feePoint: BigNumber;
    totalValue: BigNumber;
  };
}

export interface PyraMarketInterface extends utils.Interface {
  functions: {
    "BASE_FEE_POINT()": FunctionFragment;
    "CREATOR_PREMINT()": FunctionFragment;
    "PROTOCOL_FEE_POINT()": FunctionFragment;
    "PROTOCOL_TREASURY()": FunctionFragment;
    "buyShares(address,uint256)": FunctionFragment;
    "createShare(string,string,uint256)": FunctionFragment;
    "getBuyPrice(address,uint256)": FunctionFragment;
    "getBuyPriceAfterFee(address,uint256)": FunctionFragment;
    "getPrice(uint256,uint256)": FunctionFragment;
    "getSellPrice(address,uint256)": FunctionFragment;
    "getSellPriceAfterFee(address,uint256)": FunctionFragment;
    "getShareInfo(address)": FunctionFragment;
    "sellShares(address,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "BASE_FEE_POINT"
      | "CREATOR_PREMINT"
      | "PROTOCOL_FEE_POINT"
      | "PROTOCOL_TREASURY"
      | "buyShares"
      | "createShare"
      | "getBuyPrice"
      | "getBuyPriceAfterFee"
      | "getPrice"
      | "getSellPrice"
      | "getSellPriceAfterFee"
      | "getShareInfo"
      | "sellShares"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "BASE_FEE_POINT",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "CREATOR_PREMINT",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "PROTOCOL_FEE_POINT",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "PROTOCOL_TREASURY",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "buyShares",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "createShare",
    values: [string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getBuyPrice",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getBuyPriceAfterFee",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getPrice",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getSellPrice",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getSellPriceAfterFee",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getShareInfo",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "sellShares",
    values: [string, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "BASE_FEE_POINT",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "CREATOR_PREMINT",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "PROTOCOL_FEE_POINT",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "PROTOCOL_TREASURY",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "buyShares", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "createShare",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBuyPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBuyPriceAfterFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getPrice", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getSellPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getSellPriceAfterFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getShareInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "sellShares", data: BytesLike): Result;

  events: {
    "SharesBought(address,uint256,uint256)": EventFragment;
    "SharesSold(address,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "SharesBought"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SharesSold"): EventFragment;
}

export interface SharesBoughtEventObject {
  trader: string;
  amount: BigNumber;
  price: BigNumber;
}
export type SharesBoughtEvent = TypedEvent<
  [string, BigNumber, BigNumber],
  SharesBoughtEventObject
>;

export type SharesBoughtEventFilter = TypedEventFilter<SharesBoughtEvent>;

export interface SharesSoldEventObject {
  trader: string;
  amount: BigNumber;
  price: BigNumber;
}
export type SharesSoldEvent = TypedEvent<
  [string, BigNumber, BigNumber],
  SharesSoldEventObject
>;

export type SharesSoldEventFilter = TypedEventFilter<SharesSoldEvent>;

export interface PyraMarket extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: PyraMarketInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    BASE_FEE_POINT(overrides?: CallOverrides): Promise<[BigNumber]>;

    CREATOR_PREMINT(overrides?: CallOverrides): Promise<[BigNumber]>;

    PROTOCOL_FEE_POINT(overrides?: CallOverrides): Promise<[BigNumber]>;

    PROTOCOL_TREASURY(overrides?: CallOverrides): Promise<[string]>;

    buyShares(
      person: string,
      amount: BigNumberish,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<ContractTransaction>;

    createShare(
      shareName: string,
      shareSymbol: string,
      feePoint: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    getBuyPrice(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getBuyPriceAfterFee(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getPrice(
      supply: BigNumberish,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getSellPrice(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getSellPriceAfterFee(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getShareInfo(
      person: string,
      overrides?: CallOverrides
    ): Promise<[PyraMarket.ShareInfoStructOutput]>;

    sellShares(
      person: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  BASE_FEE_POINT(overrides?: CallOverrides): Promise<BigNumber>;

  CREATOR_PREMINT(overrides?: CallOverrides): Promise<BigNumber>;

  PROTOCOL_FEE_POINT(overrides?: CallOverrides): Promise<BigNumber>;

  PROTOCOL_TREASURY(overrides?: CallOverrides): Promise<string>;

  buyShares(
    person: string,
    amount: BigNumberish,
    overrides?: PayableOverrides & { from?: string }
  ): Promise<ContractTransaction>;

  createShare(
    shareName: string,
    shareSymbol: string,
    feePoint: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  getBuyPrice(
    person: string,
    amount: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getBuyPriceAfterFee(
    person: string,
    amount: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getPrice(
    supply: BigNumberish,
    amount: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getSellPrice(
    person: string,
    amount: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getSellPriceAfterFee(
    person: string,
    amount: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getShareInfo(
    person: string,
    overrides?: CallOverrides
  ): Promise<PyraMarket.ShareInfoStructOutput>;

  sellShares(
    person: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    BASE_FEE_POINT(overrides?: CallOverrides): Promise<BigNumber>;

    CREATOR_PREMINT(overrides?: CallOverrides): Promise<BigNumber>;

    PROTOCOL_FEE_POINT(overrides?: CallOverrides): Promise<BigNumber>;

    PROTOCOL_TREASURY(overrides?: CallOverrides): Promise<string>;

    buyShares(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    createShare(
      shareName: string,
      shareSymbol: string,
      feePoint: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    getBuyPrice(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getBuyPriceAfterFee(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPrice(
      supply: BigNumberish,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getSellPrice(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getSellPriceAfterFee(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getShareInfo(
      person: string,
      overrides?: CallOverrides
    ): Promise<PyraMarket.ShareInfoStructOutput>;

    sellShares(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "SharesBought(address,uint256,uint256)"(
      trader?: string | null,
      amount?: null,
      price?: null
    ): SharesBoughtEventFilter;
    SharesBought(
      trader?: string | null,
      amount?: null,
      price?: null
    ): SharesBoughtEventFilter;

    "SharesSold(address,uint256,uint256)"(
      trader?: string | null,
      amount?: null,
      price?: null
    ): SharesSoldEventFilter;
    SharesSold(
      trader?: string | null,
      amount?: null,
      price?: null
    ): SharesSoldEventFilter;
  };

  estimateGas: {
    BASE_FEE_POINT(overrides?: CallOverrides): Promise<BigNumber>;

    CREATOR_PREMINT(overrides?: CallOverrides): Promise<BigNumber>;

    PROTOCOL_FEE_POINT(overrides?: CallOverrides): Promise<BigNumber>;

    PROTOCOL_TREASURY(overrides?: CallOverrides): Promise<BigNumber>;

    buyShares(
      person: string,
      amount: BigNumberish,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<BigNumber>;

    createShare(
      shareName: string,
      shareSymbol: string,
      feePoint: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    getBuyPrice(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getBuyPriceAfterFee(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPrice(
      supply: BigNumberish,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getSellPrice(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getSellPriceAfterFee(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getShareInfo(person: string, overrides?: CallOverrides): Promise<BigNumber>;

    sellShares(
      person: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    BASE_FEE_POINT(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    CREATOR_PREMINT(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    PROTOCOL_FEE_POINT(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    PROTOCOL_TREASURY(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    buyShares(
      person: string,
      amount: BigNumberish,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    createShare(
      shareName: string,
      shareSymbol: string,
      feePoint: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    getBuyPrice(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getBuyPriceAfterFee(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPrice(
      supply: BigNumberish,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getSellPrice(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getSellPriceAfterFee(
      person: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getShareInfo(
      person: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    sellShares(
      person: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}
