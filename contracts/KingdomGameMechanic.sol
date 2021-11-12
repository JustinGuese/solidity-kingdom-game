pragma solidity ^0.8;

import "./KingdomTitles.sol";

contract KingdomGameMechanic is KingdomTitles {

    uint private nowStore;

    event Log(uint error);

    constructor (KingdomSeedCoin _kgdsc, KingdomAttackCoin _kgdat, KingdomDefenseCoin _kgddf) KingdomTitles(_kgdsc, _kgdat, _kgddf) {
        nowStore = block.timestamp;
    }

    event Attack(address attacker, address defender, 
                uint attacker_id, uint defender_id, 
                uint attackPointsBefore, uint defensePointsBefore,
                uint deadAttackers, uint deadDefenders,
                bool won);

    event Sacked(address attacker, address defender, 
                uint new_attacker_id, uint new_defender_id);

    modifier hasTitle {
        require(balanceOf(msg.sender) > 0, "to use this function you need a title! go buy one!");
        _;
    }

    modifier contractNeedsTotalControl {
        require(isApprovedForAll(msg.sender, address(this)), "you need to call setApprovalForAll in order to play a game...");
        _;
    }

    struct AttackResult {
        bool won;
        uint titleId;
        uint bossid;
        address bossid_address;
        uint deadAttackers;
        uint deadDefenders;
        bool ready4Attack;
        uint attacker_Attackpoints;
        uint defender_Defensepoints;
        uint attacker_attackMultiplier;
        uint defender_defenseMultiplier;
    }

    function _random() private returns (uint) {
        // random number between 0 and 99
        uint random = uint( uint(keccak256(abi.encodePacked(block.difficulty, nowStore))) % 100);
        nowStore = uint(nowStore + random);
        return random;
    }



    function _getLeftChild(uint id) internal pure returns (uint left) {
        return id * 2;
    }

    function _getRightChild(uint id) internal pure returns (uint right) {
        return _getLeftChild(id) + 1;
    }

    function getServants(uint id) public view returns (uint left, uint right) {
        uint currentPos = currentPosition();
        require(id <= currentPos, "id is not yet assigned");

        // binary tree
        left = _getLeftChild(id);
        right = _getRightChild(id);

        // check if they even exist yet
        
        if (left > currentPos) {
            left = 0;
        }
        if (right > currentPos) {
            right = 0;
        }
        return (left, right);
    }

    function getBossRank(uint id) public view returns (uint bossrank) {
        uint currentPos = currentPosition();
        require(0 < id && id <= currentPos, "id is not yet assigned");

        // first we have to understand that its a binary tree, and only member 2,3 can attack 1
        // additionally we can only attack a rank, not the id. eg rank and id can be different.
        // meaning rank 2 can only attack 1, rank 4 & 5 can only attac rank 2
        uint servantRank = getRankOfId(id);
        // meaning player can only attack his boss

        // remember binary tree
        if (servantRank == 1) {
            bossrank = 0;
        }
        else {
            if (id % 2 == 0) {
                // if even
                bossrank = servantRank / 2;
            }
            else {
                // if odd
                bossrank = (servantRank - 1) / 2;
            }
        }
        return bossrank;
    }

    function getBossId(uint playerId) public view returns (uint bossId) {
        uint bossRank = getBossRank(playerId);
        bossId = getIdOfRank(bossRank);
        return bossId;
    }

    function getTitleStats(uint titleId) public view returns (uint attackPoints, uint defensePoints, bool ready4attack, uint attackMultiplier, uint defenseMultiplier, uint moneyMultiplier) {
        require(titleId <= currentPosition(), "title id not yet assigned, go get one");
        attackPoints = kingdomtitles[titleId].attackPoints;
        defensePoints = kingdomtitles[titleId].defensePoints;
        ready4attack = kingdomtitles[titleId].readyTimeAttack >= block.timestamp;
        attackMultiplier = kingdomtitles[titleId].attackMultiplier;
        defenseMultiplier = kingdomtitles[titleId].defenseMultiplier;
        moneyMultiplier = kingdomtitles[titleId].moneyMultiplier;
        return (attackPoints, defensePoints, ready4attack, attackMultiplier, defenseMultiplier, moneyMultiplier);
    }

    function assignMilitaryToTitle(uint nrCoins, uint32 titleId, uint coinType) public {
        require(_exists(titleId), "title (token) nonexistent");
        require(nrCoins > 0, "you need to assign at least 1 coin");
        // needs an approve first!

        // first checks
        // title needs to be owned by sender -> actually allow this for guilds etc
        // require(ownerOf(titleId) == msg.sender, "you can not assign Military P")
        // check if sender has that amount
        require(coinType == 0 || coinType == 1, "other coin types not supported yet, must be 0 or 1");
        if (coinType == 0) {
            // attack points
            require(kgdat.balanceOf(msg.sender) >= nrCoins, "you do not have that many attack coins");
            kgdat.transferFrom(msg.sender, address(this), nrCoins);
            kingdomtitles[titleId].attackPoints += nrCoins;
        }
        else if (coinType == 1) {
            // def coins
            require(kgddf.balanceOf(msg.sender) >= nrCoins, "you do not have that many defense coins");
            kgddf.transferFrom(msg.sender, address(this), nrCoins);
            kingdomtitles[titleId].defensePoints += nrCoins;
        }
        // every deposit resets the readyTimeStake to now plus Cooldown
        kingdomtitles[titleId].readyTimeStake = block.timestamp + readyTimeStakeCooldown;
    }

    function withdrawMilitaryFromTitle(uint nrCoins, uint32 titleId, uint8 coinType) public {
        require(_exists(titleId), "title (token) nonexistent");
        // make sure the title is owned by the sender
        require(ownerOf(titleId) == msg.sender, "you can not withdraw Military from a title that does not belong to you");
        // if nrCoins is zero, we will try to withdraw all
        require(nrCoins >= 0, "you need to withdraw a positive amount of coins");
        // needs an approve first!

        require(coinType == 0 || coinType == 1, "other coin types not supported yet, must be 0 or 1");
        if (coinType == 0) {
            // attack points
            require(kingdomtitles[titleId].attackPoints >= nrCoins, "you do not have that many attack coins");
            // we can't run this classic transferFrom because it needs to be executed by the contract owner on a regular basis kgdat.transferFrom(address(this), msg.sender, nrCoins);
            // payOutSoon.push(PayOutSoon(msg.sender, nrCoins, coinType));
            kgdat.transferFrom(address(this), msg.sender, nrCoins);
            kingdomtitles[titleId].attackPoints -= nrCoins;
        }
        else if (coinType == 1) {
            // def coins
            require(kingdomtitles[titleId].defensePoints >= nrCoins, "you do not have that many defense coins");
            // we can't run this classic transferFrom because it needs to be executed by the contract owner on a regular basis kgdat.transferFrom(address(this), msg.sender, nrCoins);
            // payOutSoon.push(PayOutSoon(msg.sender, nrCoins, coinType));
            kgddf.transferFrom(address(this), msg.sender, nrCoins);
            kingdomtitles[titleId].defensePoints -= nrCoins;
        }
    }

    function _divide(uint numerator, uint denominator) private pure returns (uint quotient, uint remainder) {
        quotient  = numerator / denominator;
        remainder = numerator - denominator * quotient;
        return (quotient, remainder);
    }

    function _handleSacking(AttackResult memory resy) internal {
        kingdomtitles[resy.titleId].attackPoints -= resy.deadAttackers;
        require(kingdomtitles[resy.titleId].attackPoints >= 0, "uhoh, the attackpoints are zero...");
        kingdomtitles[resy.bossid].defensePoints -= resy.deadDefenders; 
        require(kingdomtitles[resy.bossid].defensePoints >= 0, "uhoh, the defensepoints are zero...");

        // finally check if a title rank swap happens
        // attackresults function
        if (resy.won) {
            // not the nft changes ownership, but actually the title rank
            uint old_defenderrank_tmp = title2Rank[resy.bossid];
            title2Rank[resy.bossid] = title2Rank[resy.titleId];
            title2Rank[resy.titleId] = old_defenderrank_tmp;
            
            emit Sacked(msg.sender, resy.bossid_address, 
                    old_defenderrank_tmp, title2Rank[resy.titleId]);
        }
    }

    function attackBoss(uint titleId) public hasTitle {
        require(ownerOf(titleId) == msg.sender, "sorry, only the owner of a title can attack his boss");

        // for memory reasons we need 2 do this
        AttackResult memory resy = AttackResult(
            false, titleId, getBossId(titleId), ownerOf(getBossId(titleId)), 0, 0, false, 0, 0, 0, 0);

        require(resy.bossid_address != msg.sender, "boy, don't attack yourself plz");

        (resy.attacker_Attackpoints, , resy.ready4Attack, resy.attacker_attackMultiplier, , ) = getTitleStats(titleId);
        // temporary disabled for debugging
        // require(resy.ready4Attack, "your attack cooldown is not down yet. please try again after cooldown");

        ( , resy.defender_Defensepoints, , , resy.defender_defenseMultiplier, ) = getTitleStats(resy.bossid);

        uint tmp_game_defender_Defensepoints = (resy.defender_Defensepoints * 15 * resy.defender_defenseMultiplier) / 10; // counts 1.5

        uint tmp_attacker_Attackpoints = resy.attacker_Attackpoints * resy.attacker_attackMultiplier;

        // make it so that more than double attack points is a sure win
        uint randy = _random();
        (uint quotient, uint remainder) = _divide(tmp_attacker_Attackpoints, tmp_game_defender_Defensepoints); // double would be 20

        if (quotient > 3) {
            // no discussion needed
            resy.deadDefenders = resy.defender_Defensepoints;
            resy.deadAttackers = 0;
            resy.won = true;
        }
        else if (quotient > 2) {
            // more than double the attackers
            resy.deadDefenders = resy.defender_Defensepoints;
            resy.won = true;
            // some attackers dead except rare case
            resy.deadAttackers = uint(resy.attacker_Attackpoints / 10);
            if (randy > 90) {
                // in a rare case not all defenders die, some can flee
                resy.deadDefenders = uint(resy.defender_Defensepoints / 2);
            }
        }
        else if (quotient > 1 && remainder > 5) {
            resy.won = true;
            resy.deadDefenders = uint(resy.defender_Defensepoints / 2);
            resy.deadAttackers = uint(resy.attacker_Attackpoints / 2);
        }
        else {
            // tmp
            resy.won = false;
            resy.deadDefenders = randy;
            resy.deadAttackers = randy;
        }
        // emit that event
        emit Attack(msg.sender, resy.bossid_address, 
                titleId, resy.bossid, 
                resy.attacker_Attackpoints, resy.defender_Defensepoints,
                resy.deadAttackers, resy.deadDefenders,
                resy.won);

        _handleSacking(resy);
        
    }
}