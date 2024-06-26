/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { RevenuePool, RevenuePoolInterface } from "../RevenuePool";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        internalType: "address",
        name: "share",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "AddressEmptyCode",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "AddressInsufficientBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedInnerCall",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientShares",
    type: "error",
  },
  {
    inputs: [],
    name: "NotPyraMarket",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    inputs: [],
    name: "Unclaimable",
    type: "error",
  },
  {
    inputs: [],
    name: "COEFFICIENT",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "CREATOR",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PYRA_MARKET",
    outputs: [
      {
        internalType: "contract PyraMarket",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "SHARE",
    outputs: [
      {
        internalType: "contract Share",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "shareholder",
        type: "address",
      },
    ],
    name: "getClaimableRevenue",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "shareholder",
        type: "address",
      },
    ],
    name: "getStakeStatus",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "sharesAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "revenuePerShare",
            type: "uint256",
          },
        ],
        internalType: "struct RevenuePool.StakeStatus",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "revenuePerShare",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "sharesAmount",
        type: "uint256",
      },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "sharesAmount",
        type: "uint256",
      },
    ],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "shareholder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "claimAt",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "revenue",
        type: "uint256",
      },
    ],
    name: "RevenueClaimed",
    type: "event",
  },
] as const;

const _bytecode =
  "0x60e060405234801561001057600080fd5b50604051610bdb380380610bdb83398101604081905261002f91610066565b336080526001600160a01b0391821660a0521660c052610099565b80516001600160a01b038116811461006157600080fd5b919050565b6000806040838503121561007957600080fd5b6100828361004a565b91506100906020840161004a565b90509250929050565b60805160a05160c051610ae36100f86000396000818160b20152818161028d015281816103ca015281816105d201526106d00152600061033e0152600081816101d60152818161040d0152818161051901526107130152610ae36000f3fe6080604052600436106100955760003560e01c8063a211c43311610059578063a211c43314610245578063a694fc3a1461025b578063bd64486a1461027b578063e3103f23146102af578063e4fbb6091461032c57600080fd5b8063065decc61461016e5780632e17de78146101a4578063474a04d7146101c45780634e71d92d146102105780634f4dac6f1461022557600080fd5b36610169576040516370a0823160e01b81523060048201526000907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906370a0823190602401602060405180830381865afa158015610101573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610125919061098c565b9050801561016757806101476ec097ce7bc90715b34b9f1000000000346109bb565b61015191906109d2565b60008082825461016191906109f4565b90915550505b005b600080fd5b34801561017a57600080fd5b506101916ec097ce7bc90715b34b9f100000000081565b6040519081526020015b60405180910390f35b3480156101b057600080fd5b506101676101bf366004610a07565b610360565b3480156101d057600080fd5b506101f87f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b03909116815260200161019b565b34801561021c57600080fd5b50610167610475565b34801561023157600080fd5b50610191610240366004610a20565b610550565b34801561025157600080fd5b5061019160005481565b34801561026757600080fd5b50610167610276366004610a07565b6105bb565b34801561028757600080fd5b506101f87f000000000000000000000000000000000000000000000000000000000000000081565b3480156102bb57600080fd5b506103116102ca366004610a20565b6040805180820190915260008082526020820152506001600160a01b0316600090815260016020818152604092839020835180850190945280548452909101549082015290565b6040805182518152602092830151928101929092520161019b565b34801561033857600080fd5b506101f87f000000000000000000000000000000000000000000000000000000000000000081565b3360009081526001602052604090205481111561039057604051633999656760e01b815260040160405180910390fd5b610398610475565b33600090815260016020526040812080548392906103b7908490610a49565b909155506103f190506001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016338361074a565b60405163aa4e67cf60e01b8152336004820152602481018290527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063aa4e67cf906044015b600060405180830381600087803b15801561045a57600080fd5b505af115801561046e573d6000803e3d6000fd5b5050505050565b3360009081526001602052604081205490036104a4576040516311ef236560e21b815260040160405180910390fd5b60006104af33610550565b6000805433825260016020819052604090922090910155905080156104fd57604051339082156108fc029083906000818181858888f193505050501580156104fb573d6000803e3d6000fd5b505b6040516303b1ceb960e01b8152336004820152602481018290527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906303b1ceb990604401610440565b6001600160a01b03811660009081526001602081905260408220015481546ec097ce7bc90715b34b9f10000000009161058891610a49565b6001600160a01b0384166000908152600160205260409020546105ab91906109bb565b6105b591906109d2565b92915050565b6040516370a0823160e01b815233600482015281907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906370a0823190602401602060405180830381865afa158015610621573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610645919061098c565b101561066457604051633999656760e01b815260040160405180910390fd5b336000908152600160205260409020541561068657610681610475565b61069e565b60008054338252600160208190526040909220909101555b33600090815260016020526040812080548392906106bd9084906109f4565b909155506106f890506001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000163330846107ae565b60405162c30fb560e31b8152336004820152602481018290527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906306187da890604401610440565b6040516001600160a01b038381166024830152604482018390526107a991859182169063a9059cbb906064015b604051602081830303815290604052915060e01b6020820180516001600160e01b0383818316178352505050506107ed565b505050565b6040516001600160a01b0384811660248301528381166044830152606482018390526107e79186918216906323b872dd90608401610777565b50505050565b60006108026001600160a01b03841683610855565b905080516000141580156108275750808060200190518101906108259190610a5c565b155b156107a957604051635274afe760e01b81526001600160a01b03841660048201526024015b60405180910390fd5b60606108638383600061086a565b9392505050565b60608147101561088f5760405163cd78605960e01b815230600482015260240161084c565b600080856001600160a01b031684866040516108ab9190610a7e565b60006040518083038185875af1925050503d80600081146108e8576040519150601f19603f3d011682016040523d82523d6000602084013e6108ed565b606091505b50915091506108fd868383610907565b9695505050505050565b60608261091c5761091782610963565b610863565b815115801561093357506001600160a01b0384163b155b1561095c57604051639996b31560e01b81526001600160a01b038516600482015260240161084c565b5080610863565b8051156109735780518082602001fd5b604051630a12f52160e11b815260040160405180910390fd5b60006020828403121561099e57600080fd5b5051919050565b634e487b7160e01b600052601160045260246000fd5b80820281158282048414176105b5576105b56109a5565b6000826109ef57634e487b7160e01b600052601260045260246000fd5b500490565b808201808211156105b5576105b56109a5565b600060208284031215610a1957600080fd5b5035919050565b600060208284031215610a3257600080fd5b81356001600160a01b038116811461086357600080fd5b818103818111156105b5576105b56109a5565b600060208284031215610a6e57600080fd5b8151801515811461086357600080fd5b6000825160005b81811015610a9f5760208186018101518583015201610a85565b50600092019182525091905056fea26469706673582212206325aeb1e408c758280e708164c5c995f67a55137d712a0d05ec39f93248304a64736f6c63430008150033";

type RevenuePoolConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: RevenuePoolConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class RevenuePool__factory extends ContractFactory {
  constructor(...args: RevenuePoolConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    creator: string,
    share: string,
    overrides?: Overrides & { from?: string }
  ): Promise<RevenuePool> {
    return super.deploy(
      creator,
      share,
      overrides || {}
    ) as Promise<RevenuePool>;
  }
  override getDeployTransaction(
    creator: string,
    share: string,
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(creator, share, overrides || {});
  }
  override attach(address: string): RevenuePool {
    return super.attach(address) as RevenuePool;
  }
  override connect(signer: Signer): RevenuePool__factory {
    return super.connect(signer) as RevenuePool__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RevenuePoolInterface {
    return new utils.Interface(_abi) as RevenuePoolInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): RevenuePool {
    return new Contract(address, _abi, signerOrProvider) as RevenuePool;
  }
}
