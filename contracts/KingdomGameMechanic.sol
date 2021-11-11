pragma solidity ^0.8;

import "./KingdomTitles.sol";

contract KingdomGameMechanic is KingdomTitles {

    uint private nowStore;

    event Log(uint error);

    constructor (KingdomSeedCoin _kgdsc, KingdomAttackCoin _kgdat, KingdomDefenseCoin _kgddf) KingdomTitles(_kgdsc, _kgdat, _kgddf) {
        nowStore = block.timestamp;
    }

    struct AttackResults {
        uint titleId;
        uint bossid;
        address sender;
        address bossid_address;
        uint attacker_Attackpoints;
        uint defender_Defensepoints;
        uint deadAttackers;
        uint deadDefenders;
        bool won;
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
        uint currentPos = currentPosition();
        require(0 < titleId && titleId <= currentPos, "title id is not yet assigned");
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
    }

    function _attackResults(AttackResults memory attres) internal {
        // we have to give the title of the looser to the attacker
        if (attres.won) {
            // not the nft changes ownership, but actually the title rank
            uint old_defenderrank_tmp = title2Rank[attres.bossid];
            uint old_attackerrank_tmp = title2Rank[attres.titleId];
            title2Rank[attres.bossid] = old_attackerrank_tmp;
            title2Rank[attres.titleId] = old_defenderrank_tmp;
            
            emit Sacked(attres.sender, attres.bossid_address, 
                    old_defenderrank_tmp, old_attackerrank_tmp);

            delete old_attackerrank_tmp;
            delete old_defenderrank_tmp;
        }
        // next we have to let the people die accordingly
        emit Attack(attres.sender, attres.bossid_address, 
                attres.titleId, attres.bossid, 
                attres.attacker_Attackpoints, attres.defender_Defensepoints,
                attres.deadAttackers, attres.deadDefenders,
                attres.won);
        // finally update the title struct
        kingdomtitles[attres.titleId].attackPoints -= attres.deadAttackers;
        require(kingdomtitles[attres.titleId].attackPoints > 0, "uhoh, the attackpoints are zero...");
        kingdomtitles[attres.bossid].defensePoints -= attres.deadDefenders; 
        require(kingdomtitles[attres.bossid].defensePoints > 0, "uhoh, the defensepoints are zero...");
    }

    function _divide(uint numerator, uint denominator) private pure returns (uint quotient, uint remainder) {
        quotient  = numerator / denominator;
        remainder = numerator - denominator * quotient;
        return (quotient, remainder);
    }

    function attackBoss(uint titleId) public hasTitle {
        require(ownerOf(titleId) == msg.sender, "sorry, only the owner of a title can attack his boss");

        uint bossid = getBossId(titleId);
        address bossid_address = ownerOf(bossid);
        // check if boss setApprovalForAll as well, required
        // require(isApprovedForAll(bossid_address, address(this)), "your boss needs to setApprovedForAll to this contract, otherwise the mechanism does not work. He only earns money if that approval has been set though.");

        require(bossid_address != msg.sender, "boy, don't attack yourself plz");

        (uint attacker_Attackpoints, , bool ready4Attack, uint attacker_attackMultiplier, , ) = getTitleStats(titleId);
        require(ready4Attack, "your attack cooldown is not down yet. please try again after cooldown");

        ( , uint defender_Defensepoints, , , uint defender_defenseMultiplier, ) = getTitleStats(bossid);

        uint tmp_game_defender_Defensepoints = (defender_Defensepoints * 15 * defender_defenseMultiplier) / 10; // counts 1.5
        delete defender_defenseMultiplier;

        uint tmp_attacker_Attackpoints = attacker_Attackpoints * attacker_attackMultiplier;
        delete attacker_attackMultiplier;

        // make it so that more than double attack points is a sure win
        uint randy = _random();
        (uint quotient, uint remainder) = _divide(tmp_attacker_Attackpoints, tmp_game_defender_Defensepoints); // double would be 20
        uint deadAttackers = 0;
        uint deadDefenders = 0;
        bool won = false;
        if (quotient > 3) {
            // no discussion needed
            deadDefenders = defender_Defensepoints;
            deadAttackers = 0;
            won = true;
        }
        else if (quotient > 2) {
            // more than double the attackers
            deadDefenders = defender_Defensepoints;
            won = true;
            // some attackers dead except rare case
            deadAttackers = uint(attacker_Attackpoints / 10);
            if (randy > 90) {
                // in a rare case not all defenders die, some can flee
                deadDefenders = uint(defender_Defensepoints / 2);
            }
        }
        else if (quotient > 1 && remainder > 5) {
            won = true;
            deadDefenders = uint(defender_Defensepoints / 2);
            deadAttackers = uint(attacker_Attackpoints / 2);
        }
        else {
            // tmp
            won = false;
            deadDefenders = randy;
            deadAttackers = randy;
        }
        delete randy;
        delete tmp_attacker_Attackpoints;
        delete tmp_game_defender_Defensepoints;

        AttackResults memory resulty = AttackResults(
                    titleId, bossid,
                    msg.sender, bossid_address,
                    attacker_Attackpoints, defender_Defensepoints,
                    deadAttackers, deadDefenders, won);
        delete attacker_Attackpoints;
        delete defender_Defensepoints;
        delete bossid;
        delete bossid_address;
        delete won;
        delete quotient;
        delete remainder;
        delete deadDefenders;
        delete deadAttackers;
        delete titleId;
        delete bossid;

        _attackResults(resulty);
    }
}