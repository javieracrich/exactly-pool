# Ethereum Solidity Starter

This is a skeleton repository to work as a foundation for a smart contracts project using Solidity.

## Quickstart

1. Clone the repo
2. Run `yarn install`

## What’s Included?

- **[Hardhat](https://hardhat.org/)**: Ethereum development environment for professionals.
- **[Waffle](https://getwaffle.io/)**: The most advanced framework for testing smart contracts
- **[Typechain](https://github.com/ethereum-ts/TypeChain)**: TypeScript bindings for Ethereum smart contracts
- **[Tenderly](https://tenderly.co/)**: Real-time monitoring, alerting, and troubleshooting for Smart Contracts.
- **[Ethers]()**: A complete Ethereum wallet implementation and utilities in JavaScript (and TypeScript).
- **[Etherscan](https://etherscan.io)**: Verify contracts in The Ethereum Blockchain Explorer

#### Hardhat Plugins
- ABI Exporter
- Gas Reporter
- Contract Sizer
- OpenZeppelin Upgrades
## Usage

Look at the `package.json` inside scripts section to see available commands. A number of helper build scripts are located in `/scripts`.
### Build contracts

Compiles contracts and creates Typechain bindings.

`yarn build`

### Run tests

Runs all tests in the `/test` folder.

`yarn test`

### Run tests with gas report

Run all tests calculating gas estimations.

`yarn test:gas`

The gas report will be saved on the `/reports` folder.

### Deploy to Ethereum

Create/modify network config in hardhat.config.ts and add API key and private key, then run:

`npx hardhat run --network rinkeby scripts/deploy.ts`

### Verify on Etherscan

Using the hardhat-etherscan plugin, add Etherscan API key to hardhat.config.ts, then run:

`npx hardhat verify --network rinkeby <DEPLOYED ADDRESS>`


## ASSUMPTIONS 

-POOL REWARDS ARE A ERC20 TOKEN
-RWD TOKEN INITTIAL SUPPLY IS ZERO

## ADDRESSES

RWD token address 0x4A1212E5BD80e7aA6f5802BDB3e6fBddd87F261B

exactly pool address 0xE6604eeC89C497e2157bd7fBC5024E32ef461939

rwd deploy transaction hash 0x268c0611a709dbb4bd80414181538634d4198edc2482fb3bc28415ed62e5b741

pool deploy transaction hash 0x6d8d41ac5b50ab8080d77f58b01edfa924211b5d8870cc4f50fb137d68a1232e


## See verified contract in etherscan 

https://rinkeby.etherscan.io/address/0xE6604eeC89C497e2157bd7fBC5024E32ef461939#code

