import '@nomiclabs/hardhat-ethers'
import { ethers } from 'hardhat'

async function main() {
  const rewardFactory = await ethers.getContractFactory('RewardToken');
  const poolFactory = await ethers.getContractFactory('ExactlyPool');

  // If we had constructor arguments, they would be passed into deploy()
  const rewardContract = await rewardFactory.deploy(0);
  const poolContract = await poolFactory.deploy(rewardContract.address);


  // The address the Contract WILL have once mined
  console.log("RWD token address", rewardContract.address)
  console.log("exactly pool address", poolContract.address)

  // The transaction that was sent to the network to deploy the Contract
  console.log("rwd deploy transaction hash", rewardContract.deployTransaction.hash)
  console.log("pool deploy transaction hash", poolContract.deployTransaction.hash)

  // The contract is NOT deployed yet; we must wait until it is mined
  await rewardContract.deployed();
  await poolContract.deployed()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
