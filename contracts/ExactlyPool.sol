// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "hardhat/console.sol";
import "./RewardToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// NOTE: This is just a test contract, please delete me

contract ExactlyPool is Ownable {
    RewardToken private rewardToken;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public depositTimestamp;
    mapping(address => uint256) public lastWithdrawTimestamp;
    uint256 public participants = 0;
    uint256 public participantsWithdrawn = 0;
    uint256 public totalBalance = 0;
    uint256 public originalBalance = 0;
    uint256 public originalTotalRewards = 0;
    uint256 public totalRewards = 0;
    uint256 public frequency = 1 weeks;
    uint256 public time = 0;
    uint256 private ratiodiv = 10000000000000000000000000000000000000;

    constructor(RewardToken _rewardToken) {
        rewardToken = _rewardToken;
    }

    function DepositRewards(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        totalRewards = totalRewards + _amount;
        depositTimestamp[msg.sender] = getCurrentTime();
        rewardToken.mint(address(this), _amount);
        //if someone deposits eth after the reward, it wont be counted for the reward.
        originalBalance = totalBalance;
        //this is required to calculate the rewards ratio
        originalTotalRewards = totalRewards;
        participantsWithdrawn = 0;
    }

    function GetRemainingRewards() external view returns (uint256) {
        return rewardToken.balanceOf(address(this));
    }

    function GetRemainingRewardsForParticipant() public view returns (uint256) {
        if (lastWithdrawTimestamp[msg.sender] > getCurrentTime() - frequency) {
            return 0;
        }

        uint256 ratio = GetBalanceRatioForParticipant(_msgSender());
        return (originalTotalRewards * ratio) / ratiodiv;
    }

    // only for testing purposes, remove for production
    function getCurrentTime() public view returns (uint256) {
        if (time == 0) {
            return block.timestamp;
        } else {
            return time;
        }
    }

    //only for testing purposes, remove for production
    function setCurrentTime(uint256 val) external {
        time = val;
    }

    receive() external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        if (balances[_msgSender()] == 0) {
            participants++;
        }
        balances[_msgSender()] = balances[_msgSender()] + msg.value;
        depositTimestamp[_msgSender()] = getCurrentTime();
        totalBalance = totalBalance + msg.value;
    }

    function WithdrawRewards() external {
        uint256 rewards = GetRemainingRewardsForParticipant();
        require(rewards <= totalRewards, "Not enough rewards to withdraw");
        require(rewards > 0, "zero rewards available");
        totalRewards = totalRewards - rewards;
        participantsWithdrawn++;
        lastWithdrawTimestamp[msg.sender] = getCurrentTime();
        rewardToken.transfer(_msgSender(), rewards);
    }

    function WithdrawEth(uint256 _amount) external {
        //checks
        require(balances[_msgSender()] >= _amount, "Not enough funds to withdraw");
        //effects
        balances[_msgSender()] = balances[_msgSender()] - _amount;
        totalBalance = totalBalance - _amount;
        //interactions
        payable(msg.sender).transfer(_amount);
    }

    function GetBalanceRatioForParticipant(address _participant) public view returns (uint256) {
        if (originalBalance == 0) {
            return 0;
        }
        if (depositTimestamp[_participant] > depositTimestamp[owner()]) {
            return 0;
        } else {
            return (balances[_participant] * ratiodiv) / originalBalance;
        }
    }
}
