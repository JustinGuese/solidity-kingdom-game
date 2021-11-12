pragma solidity ^0.8;

import "./KingdomSeedCoin.sol";
import "./KingdomAttackCoin.sol";
import "./KingdomDefenseCoin.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract KingdomBank is Ownable {

    uint8 public exchangeRate = 10;
    // return more defensepoints as attackpoints
    uint8 public exchangeRate_Attackpoints = 10;
    uint8 public exchangeRate_Defensepoints = 8;
    uint8 public exchangeRate_Burnpct = 10;
    uint public stakingPeriod = 60 seconds;
    // needed for dividend payments
    uint public balanceLastMonth_kgdsc = 0;
    uint public balanceLastMonth_kgdat = 0;
    uint public balanceLastMonth_kgddf = 0;
    
    KingdomSeedCoin public kgdsc;
    KingdomAttackCoin public kgdat;
    KingdomDefenseCoin public kgddf;

    event enterStakingAttackPoints(address indexed _from, uint _amount);
    event enterStakingDefensePoints(address indexed _from, uint _amount);

    event HarvestAttackPoints(address indexed _to, uint _amount);
    event HarvestDefensePoints(address indexed _to, uint _amount);
    event HarvestRemainingSeedCoins(address indexed _to, uint _amount, uint _beforeBurn);
    
    struct Staking {
        uint seedCoinAmount;
        uint8 targetCoinType; // 0 = attackCoin, 1 = defenseCoin
        uint readyTime;
    }

    struct PayOutSoon {
        address to;
        uint amount;
        uint8 targetCoinType; // 0 = attackCoin, 1 = defenseCoin, 2 = seedCoin
    }

    // used in the withdraw military function in game mechanic
    PayOutSoon[] internal payOutSoon;
    mapping (address => PayOutSoon[] ) internal payOutSoonByAddress;
    
    mapping (address => Staking[]) private _Staking;

    constructor(KingdomSeedCoin _kgdsc, KingdomAttackCoin _kgdat, KingdomDefenseCoin _kgddf) {
        kgdsc = _kgdsc;
        kgdat = _kgdat;
        kgddf = _kgddf;
        // after that the coins need to be transferred to KingdomBank
        // owner = msg.sender;
    }

    modifier contractHasSeedcoins {
        require (kgdsc.balanceOf(address(this)) > 0);
        _;
    }

    modifier contractHasAttackcoins {
        require (kgdat.balanceOf(address(this)) > 0);
        _;
    }

    modifier contractHasDefensecoins {
        require (kgddf.balanceOf(address(this)) > 0);
        _;
    }
    
    // you can only buy the seed coins 
    function buyForETH() external payable contractHasSeedcoins {
        require(msg.value > 0, "you have to send some ETH to get KingdomSeedcoin");
        require(kgdsc.balanceOf(address(this)) > 0, "uhoh, sry i can't send any more KingdomSeedcoin");
        
        uint rewardTokens = msg.value * exchangeRate;
        kgdsc.transfer(msg.sender, rewardTokens);
    }
    
    function justSendETH() public payable  returns(uint){
        return address(this).balance;
    }
    
    function plantSeeds(uint nrSeedCoins, uint8 targetCoin) public contractHasAttackcoins contractHasDefensecoins {
        // aka staking
        uint kgdsc_balance = kgdsc.balanceOf(msg.sender);
        require(kgdsc_balance >= nrSeedCoins && nrSeedCoins > 0, "you don't have enough seedcoins! buy or trade some");
        require(targetCoin == 0 || targetCoin == 1, "targetCoin has to be 0=attackcoin or 1=defensecoin");
        // enter staking
        // first transact the kgdsc
        // first approve built in 

        if (targetCoin == 0) {
            emit enterStakingAttackPoints(msg.sender, nrSeedCoins);
        }
        else if (targetCoin == 1) {
            emit enterStakingDefensePoints(msg.sender, nrSeedCoins);
        }
        // kgdsc.approve(address(this), nrSeedCoins);
        kgdsc.transferFrom(msg.sender, address(this), nrSeedCoins);
        


        // then store in array
        _Staking[msg.sender].push(Staking(
            nrSeedCoins,
            targetCoin,
            block.timestamp + stakingPeriod
            ));
    }
    
    function getCurrentStakes() public view returns(uint[3] memory){
        uint attackPoints = 0;
        uint defensePoints = 0;
        uint activeStakes = 0;
        for (uint i = 0; i < _Staking[msg.sender].length; i++) {
            Staking memory stakeobj = _Staking[msg.sender][i];
            // first check if it is an empty hull
            if (stakeobj.readyTime == 0) {
                continue; // skip this if empty (has been previously deleted)
            }
            activeStakes++;
            if (stakeobj.targetCoinType == 0) {
                attackPoints += stakeobj.seedCoinAmount;
            }
            else if (stakeobj.targetCoinType == 1) {
                defensePoints += stakeobj.seedCoinAmount;
            }
        }
        // , attackStakeTimeRemaining, defenseStakeTimeRemaining
        uint[3] memory res = [attackPoints, defensePoints, activeStakes];
        return res;
    }

    function getTimeUntilStakingDone() public view returns(uint[3] memory timeuntildone){
        // somehow we need to seperate this functionality from the other, as this causes
        // a buffer overflow error if not
        // returns 9999999 for a coin if it is not staking
        timeuntildone = [uint(9999999),uint(9999999), 0];
        // save the value for the shortest stake
        for (uint i = 0; i < _Staking[msg.sender].length; i++) {
            Staking memory stakeobj = _Staking[msg.sender][i];
            // first check if it is an empty hull
            if (stakeobj.readyTime == 0) {
                continue; // skip this if empty (has been previously deleted)
            }
            // for every active stake, add plus one
            timeuntildone[2]++;
            if (stakeobj.targetCoinType == 0) {
                if (uint(stakeobj.readyTime) > uint(block.timestamp)) {
                    // still kind of faulty, because there can be multiple staking objects
                    uint remaining = uint(stakeobj.readyTime - block.timestamp);
                    if (remaining < timeuntildone[0]) {
                        // if shorter, then this is our next stake done time
                        timeuntildone[0] = remaining;
                    }
                }
                else {
                    // if the readytime is in the past, then we can harvest
                    timeuntildone[0] = uint(0);
                }
            }
            else if (stakeobj.targetCoinType == 1) {
                if (uint(stakeobj.readyTime) > uint(block.timestamp)) {
                    uint remaining = uint(stakeobj.readyTime - block.timestamp);
                    if (remaining < timeuntildone[0]) {
                        timeuntildone[1] = remaining;
                    }
                }
                else {
                    timeuntildone[1] = uint(0);
                }
            }
        }
        return timeuntildone;
    }

    function _burnReturnSeedcoins(uint nrSeedCoins) internal {
        uint remainingSeedcoins = nrSeedCoins - (nrSeedCoins * exchangeRate_Burnpct / 100);
        kgdsc.transfer(msg.sender, remainingSeedcoins);
        emit HarvestRemainingSeedCoins(msg.sender, remainingSeedcoins, nrSeedCoins);
    }

    function harvestAll() public returns (bool success) {
        // harvesting all ready coins
        success = false;
        for (uint i = 0; i < _Staking[msg.sender].length; i++) {
            Staking memory stakeobj = _Staking[msg.sender][i];
            if (stakeobj.readyTime < block.timestamp) {
                // ready for harvest
                if (stakeobj.targetCoinType == 0) {
                    uint attackPoints = stakeobj.seedCoinAmount / exchangeRate_Attackpoints;
                    _burnReturnSeedcoins(stakeobj.seedCoinAmount);
                    kgdat.transfer(msg.sender, attackPoints);
                    emit HarvestAttackPoints(msg.sender, attackPoints);
                }
                else if (stakeobj.targetCoinType == 1) {
                    uint defensePoints = stakeobj.seedCoinAmount / exchangeRate_Defensepoints;
                    _burnReturnSeedcoins(stakeobj.seedCoinAmount);
                    kgddf.transfer(msg.sender, defensePoints);
                    emit HarvestDefensePoints(msg.sender, defensePoints);
                }
                // finally remove from array
                delete _Staking[msg.sender][i];
                // be careful, this is not a delete, but leaves an empty field in there...
                success = true;
            }
        }
        return success;
    } 

    // // payoutsoon needs to be run regularily by the contract owner to pay out open withdraw requests from the staking into military points to title
    // function payOutMilitaryWithdrawals() public onlyOwner {
    //     for (uint i = 0; i < payOutSoon.length; i++) {
    //         require(payOutSoon[i].targetCoinType == 0 || payOutSoon[i].targetCoinType == 1 , "wrong cointype for payout");
    //         if (payOutSoon[i].targetCoinType == 0) {
    //             kgdat.transferFrom(address(this), payOutSoon[i].to, payOutSoon[i].amount);
    //         }
    //         else if (payOutSoon[i].targetCoinType == 1) {
    //             kgddf.transferFrom(address(this), payOutSoon[i].to, payOutSoon[i].amount);
    //         }
    //     }
    // }
}