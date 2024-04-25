# Pyra-SDK

[![npm version](https://img.shields.io/npm/v/@pyra-marketplace/pyra-sdk.svg)](https://www.npmjs.com/package/@pyra-marketplace/pyra-sdk)
![npm](https://img.shields.io/npm/dw/@pyra-marketplace/pyra-sdk)
[![License](https://img.shields.io/npm/l/@pyra-marketplace/pyra-sdk.svg)](https://github.com/meteor-web3/meteor-hooks/blob/main/LICENSE.md)

## Overview

Based on Asset-SDK, Pyra-SDK implements a three-layer scalable data platform to monetize user content. It provides a set of easy-to-use methods and classes for PyraZone, PyraMarket, and RevenuePool.

## Install

Before installing asset-sdk, you should install [@meteor-web3/connector](https://github.com/meteor-web3/meteor-sdk/), which is the entrance of Dataverse and Meteor.

```bash
pnpm install @meteor-web3/connector # if you haven't installed it yet
pnpm install @pyra-marketplace/pyra-sdk
```

## Examples

### create pyra-zone

```typescript
import {
  Connector,
  MeteorWebProvider
} from "@meteor-web3/connector";
import { PyraZone } from "@pyra-marketplace/pyra-sdk";
import { ethers } from "ethers";

const connector = new Connector(new MeteorWebProvider());

const loadOrCreatePyraZone = async () => {
  let _assetId: string;
  const pyraZones = await PyraZone.loadPyraZones({
    chainId: ChainId.BaseSepolia,
    publishers: [connector.address]
  });
  if (pyraZones.length > 0) {
    _assetId = pyraZones[0].asset_id;
  } else {
    const pyraZone = new PyraZone({
      chainId: ChainId.BaseSepolia,
      connector
    });
    _assetId = await pyraZone.createPyraZone();
  }
  console.log({ _assetId });
};
```

### create tier-key

```typescript
import {
  Connector,
  MeteorWebProvider
} from "@meteor-web3/connector";
import { PyraZone } from "@pyra-marketplace/pyra-sdk";

const connector = new Connector(new MeteorWebProvider());

const createTierkey = async () => {
  const pyraZone = new PyraZone({
    chainId: ChainId.BaseSepolia,
    assetId: "SOME_ASSET_ID",
    connector
  });

  const res = await pyraZone.createTierkey();
  console.log({ tier: res.tier });
};
```

### create tier-file

```typescript
import {
  Connector,
  MeteorWebProvider
} from "@meteor-web3/connector";
import { PyraZone } from "@pyra-marketplace/pyra-sdk";

const connector = new Connector(new MeteorWebProvider());

const createTierFile = async (tier: number = 0) => {
  const pyraZone = new PyraZone({
    chainId: ChainId.BaseSepolia,
    assetId: "SOME_ASSET_ID",
    connector
  });

  const date = new Date().toISOString();

  const res = await pyraZone.createTierFile({
    modelId: "PYRA_MODEL_ID",
    fileName: "create a file",
    fileContent: {
      modelVersion: "0.0.1",
      title: "test title",
      description: "test description",
      tags: ["test tag1", "test tag2"],
      resources: [
        "https://bafkreib76wz6wewtkfmp5rhm3ep6tf4xjixvzzyh64nbyge5yhjno24yl4.ipfs.w3s.link"
      ],
      createdAt: date,
      updatedAt: date,
      encrypted: JSON.stringify({
        resources: true
      })
    },
    tier
  });
  const indexFileId = res.fileContent.file.fileId;
  console.log({ res, indexFileId });
};
```


You can find more pyra-sdk usage in [demo](./demo).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## Contributing

Contributions to this project are welcome. To contribute, please follow these steps:

1. Fork the repository and create a new branch.
2. Make your changes and test them thoroughly.
3. Submit a pull request with a detailed description of your changes.