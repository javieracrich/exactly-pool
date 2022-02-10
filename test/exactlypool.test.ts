import { BigNumber, Signer } from 'ethers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import '@nomiclabs/hardhat-ethers'
import { ExactlyPool__factory, ExactlyPool, RewardToken__factory, RewardToken } from '../build/types'
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

chai.use(solidity);

const { getContractFactory, getSigners } = ethers

describe('Exactly Pool', () => {
  let pool: ExactlyPool
  let rewardToken: RewardToken;
  let owner: Signer;
  let participantA: Signer;
  let participantB: Signer;
  let participantC: Signer;
  let signers: SignerWithAddress[];
  let ratiodiv = 100_000_000_000;

  beforeEach(async () => {

    signers = await getSigners();

    owner = signers[0];
    participantA = signers[1];
    participantB = signers[2];
    participantC = signers[3];
    const rewardTokenFactory = (await getContractFactory('RewardToken', owner)) as RewardToken__factory
    const initialSupply = 0;
    rewardToken = await rewardTokenFactory.deploy(initialSupply);
    const poolFactory = (await getContractFactory('ExactlyPool', owner)) as ExactlyPool__factory
    pool = await poolFactory.deploy(rewardToken.address)
    await pool.deployed();
    const minterRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
    rewardToken.grantRole(minterRole, pool.address);
    console.log("deployment finished successfully");
  })

  // it('should have the right rewards', async () => {
  //   const initialRewards = ethers.utils.parseEther('200');
  //   pool = pool.connect(owner);
  //   await pool.DepositRewards(initialRewards);
  //   const rewards = await pool.GetRemainingRewards();
  //   expect(rewards).to.eq(initialRewards);
  // })

  // it('happy path with N participants', async () => {

  //   let participantCount = random(1, 19);
  //   console.log("participantCount", participantCount);
  //   let totalEth = BigNumber.from(0);
  //   let rewards = ethers.utils.parseEther(random(100, 999).toString());
  //   console.log("rewards", ethers.utils.formatEther(rewards).toString());

  //   for (let i = 1; i <= participantCount; i++) {
  //     let participant = signers[i];
  //     let valueEth =  ethers.utils.parseEther(random(1, 100).toString());
  //     totalEth = totalEth.add(valueEth);
  //     await participant.sendTransaction({ value: valueEth, to: pool.address });
  //     const partialBalance = await pool.totalBalance();
  //     expect(partialBalance).to.eq(totalEth);
  //     const balance = await pool.balances(await participant.getAddress());
  //     expect(valueEth).to.eq(balance);

  //   }

  //   //owner deposits rewards
  //   await pool.connect(owner).DepositRewards(rewards);

  //   const expectedRewards = await pool.totalRewards();

  //   expect(expectedRewards).to.eq(rewards);



  //   for (let i = 1; i <= participantCount; i++) {
  //     let participant = signers[i];
  //     const ratio = await pool.GetBalanceRatioForParticipant(await participant.getAddress());
  //     const balance = await pool.balances(await participant.getAddress());
  //     const expectedRatio = (balance.mul(ratiodiv)).div(totalEth).toNumber();
  //     console.log("ratio", i, ratio.toNumber());
  //     console.log("expectedRatio", i, expectedRatio);
  //     expect(ratio).to.eq(expectedRatio);
  //     let remainingRewards = await pool.connect(participant).GetRemainingRewardsForParticipant();
  //     let expectedRemainingRewards = (rewards.mul(ratio)).div(ratiodiv);
  //     expect(remainingRewards).to.eq(expectedRemainingRewards);
  //     console.log("withdrawing", i, ethers.utils.formatEther(remainingRewards).toString());
  //     await pool.connect(participant).WithdrawRewards();
  //     remainingRewards = await pool.connect(participant).GetRemainingRewardsForParticipant();
  //     expect(remainingRewards).to.eq(0);
  //     const tokenBalance = await rewardToken.balanceOf(await participant.getAddress());
  //     expect(tokenBalance).to.eq(rewards.mul(ratio).div(ratiodiv));
  //   }

  //   const remainingRewards = await pool.GetRemainingRewards();
  //   console.log("remaining rewards", ethers.utils.formatEther(remainingRewards).toString());
  //   console.log("participants withdrawn", (await pool.participantsWithdrawn()).toNumber());
  //   expect(remainingRewards).to.below(ethers.utils.parseEther("0.00001"));
  // })



  it('path 1', async () => {
    //participant A deposits eth,
    //then owner deposits rewards
    //then participant B deposits eth and wants to withdraw rewards. It is not possible.
    //participant A withdraws 100% of rewards

    const valueA = ethers.utils.parseEther('100');
    const valueB = ethers.utils.parseEther('300');
    const rewards = ethers.utils.parseEther('200');

    await participantA.sendTransaction({ value: valueA, to: pool.address });

    await pool.connect(owner).DepositRewards(rewards);

    ///then participant B deposits eth and wants to withdraw rewards. It is not possible.
    await participantB.sendTransaction({ value: valueB, to: pool.address });

    let remainingRewardsA = await pool.connect(participantA).GetRemainingRewardsForParticipant();
    let remainingRewardsB = await pool.connect(participantB).GetRemainingRewardsForParticipant();

    expect(remainingRewardsA).to.eq(ethers.utils.parseEther('200'));
    expect(remainingRewardsB).to.eq(ethers.utils.parseEther('0'));

    const ratioA = await pool.GetBalanceRatioForParticipant(await participantA.getAddress());
    const ratioB = await pool.GetBalanceRatioForParticipant(await participantB.getAddress());

    expect(ratioA).to.eq(ratiodiv);
    expect(ratioB).to.eq(0);

    //participant B gets no rewards
    await expect(pool.connect(participantB).WithdrawRewards()).to.be.revertedWith("zero rewards available");
    await pool.connect(participantA).WithdrawRewards();

    //particpant A withdraws 100% of rewards
    const balanceA = await rewardToken.balanceOf(await participantA.getAddress());
    expect(balanceA).to.eq(rewards);

    const remainingRewards = await pool.GetRemainingRewards();
    expect(remainingRewards).to.eq(ethers.utils.parseEther('0'));

  })

  it('path 2', async () => {
    //owner deposits rewards
    //then, participant A wants to withdraw rewards without having deposited eth. It is not possible.

    const rewards = ethers.utils.parseEther('200');
    await pool.connect(owner).DepositRewards(rewards);
    let remainingRewardsA = await pool.connect(participantA).GetRemainingRewardsForParticipant();
    expect(remainingRewardsA).to.eq(ethers.utils.parseEther('0'));

    await expect(pool.connect(participantA).WithdrawRewards()).to.be.revertedWith("zero rewards available");
  })

  it('happy path, multiple random participants, multiple reward cycles', async () => {

    let participantCount = random(1, 19);
    console.log("participantCount: " + participantCount);
    const rewardCycles = 5;// random(1, 5);
    let totalEth = BigNumber.from(0);

    const rewards = ethers.utils.parseEther('200');

    for (let i = 1; i <= participantCount; i++) {
      const randomEthParticipation = ethers.utils.parseEther((Math.random() * 100).toString());

      await signers[i].sendTransaction({ value: randomEthParticipation, to: pool.address });
      totalEth = totalEth.add(randomEthParticipation);

      const balance = await pool.balances(await signers[i].getAddress());
      expect(balance).to.eq(randomEthParticipation);

    }

    const totalBalance = await pool.totalBalance();

    expect(totalBalance).to.eq(totalEth);

    for (let i = 1; i <= rewardCycles; i++) {

      IncreaseTime(Constants.Week);
      console.log("reward cycle", i);
      //owner deposits rewards
      await pool.connect(owner).DepositRewards(rewards);

 //     const expectedRewards = await pool.totalRewards();

  //    expect(expectedRewards).to.greaterThanOrEqual(rewards);

      for (let i = 1; i <= participantCount; i++) {

        let participant = signers[i];
        const ratio = await pool.GetBalanceRatioForParticipant(await participant.getAddress());
        const balance = await pool.balances(await participant.getAddress());
        const expectedRatio = (balance.mul(ratiodiv)).div(totalEth).toNumber();
        console.log("ratio", i, ratio.toNumber());
        console.log("expectedRatio", i, expectedRatio);
        expect(ratio).to.eq(expectedRatio);
        let remainingRewards = await pool.connect(participant).GetRemainingRewardsForParticipant();
        let expectedRemainingRewards = (rewards.mul(ratio)).div(ratiodiv);
     //   expect(remainingRewards).to.eq(expectedRemainingRewards);
        console.log("withdrawing", i, ethers.utils.formatEther(remainingRewards).toString());
        await pool.connect(participant).WithdrawRewards();
        remainingRewards = await pool.connect(participant).GetRemainingRewardsForParticipant();
        expect(remainingRewards).to.eq(0);
        const tokenBalance = await rewardToken.balanceOf(await participant.getAddress());
        expect(tokenBalance).to.eq(rewards.mul(ratio).div(ratiodiv));

      }

      const remainingRewards = await pool.GetRemainingRewards();
      console.log("remaining rewards", ethers.utils.formatEther(remainingRewards).toString());
      console.log("participants withdrawn", (await pool.participantsWithdrawn()).toNumber());
      expect(remainingRewards).to.below(ethers.utils.parseEther("0.00001"));


    }



    //participant A,B,C deposit ETH,
    //then owner deposits rewards
    //then participant A withdraws rewards. 
    //then participant A wants to withdraw rewards again before 1 week passed. 
  })



  async function IncreaseTime(seconds) {
    let time = await pool.getCurrentTime();
    time = time.add(seconds);
    await pool.setCurrentTime(time);
  }

})


function random(min, max) {
  return Math.floor((Math.random()) * (max - min + 1)) + min;
}

export class Constants {
  public static Week: number = 604_800;
  public static Day: number = 86_400;
  public static Month: number = 2_628_000;
  public static Year: number = 31_536_000;
}
