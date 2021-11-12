pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./KingdomBank.sol";

contract KingdomTitles is ERC721, KingdomBank {
    
    uint16 constant public totalSupply = 10000;
    uint constant public attackCooldown = 60 seconds;
    uint constant public readyTimeStakeCooldown = 60 seconds;
    string constant public baseUrl = "https://www.kingdomcrypto.com/titles/";

    struct KingdomTitle {
        uint attackPoints;
        uint defensePoints;
        uint readyTimeAttack;
        // for staking we reset the cooldown timer every time something is staked using the assignMilitary function
        uint readyTimeStake;
        // additional features like attack, defense or money multiplier - makes an nft special
        uint attackMultiplier;
        uint defenseMultiplier;
        uint moneyMultiplier;
    }

    KingdomTitle[totalSupply] public kingdomtitles;

    mapping (uint => uint) public title2Rank;
    uint internal titleCount;

    mapping (address => uint[]) public address2ids;

    constructor(KingdomSeedCoin kgdsc, KingdomAttackCoin kgdat, KingdomDefenseCoin kgddf) ERC721("Kingdom Titles", "KGD") KingdomBank(kgdsc, kgdat, kgddf) {
        titleCount = 0;
    }

    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function currentPosition() public view returns (uint256) {
        return uint256(titleCount);
    }

    function _calculateMultiplierPoints(uint positionId) internal pure returns (uint attackMultiplier, uint defenseMultiplier, uint moneyMultiplier) {
        uint attack = (positionId + 314) % 100;
        uint defense = (positionId + 72) % 100;
        uint money = (positionId + 39298) % 100;

        attackMultiplier = 10;
        defenseMultiplier = 10;
        moneyMultiplier = 10;
        // attack logic
        if (attack >= 95) {
            attackMultiplier = uint(attackMultiplier + 6 * (attack - 95));
        } else if (attack >= 80) {
            attackMultiplier = uint(attackMultiplier + attack - 80);
        } else if (20 <= attack && attack < 30) {
            attackMultiplier = uint(attackMultiplier + attack - 15);
        }
        // defense logic
        if (defense >= 95) {
            defenseMultiplier = uint(defenseMultiplier + 6 * (defense - 95));
        } else if (attack >= 80) {
            defenseMultiplier = uint(defenseMultiplier + defense - 80);
        } else if (10 <= defense && defense < 30) {
            defenseMultiplier = uint(defenseMultiplier + defense - 5);
        }
        // money logic
        if (money >= 80) {
            moneyMultiplier = uint(moneyMultiplier + money - 80);
        } else {
            moneyMultiplier = uint(moneyMultiplier + money / 10);
        }
        return (attackMultiplier, defenseMultiplier, moneyMultiplier);
    }

    function awardItem(address player) public onlyOwner returns (uint256) {
        require(titleCount < totalSupply, "uhoh, no titles available anymore");  

        uint256 newItemId = titleCount + 1;
        _safeMint(player, newItemId);
        // actually not necessary, because we override the tokenURI function later on
        // _setTokenURI(newItemId, BASEURL + uint2str(newItemId));

        // mark it down in address2ids
        address2ids[player].push(newItemId);

        // then add data to storage
        title2Rank[newItemId] = newItemId; // at first rank equals titleId
        (uint attackm, uint defensem, uint moneym) = _calculateMultiplierPoints(newItemId);
        kingdomtitles[newItemId] = KingdomTitle(0 , 0 ,block.timestamp + attackCooldown, block.timestamp + readyTimeStakeCooldown, attackm, defensem, moneym);

        titleCount++;

        return newItemId;
    }

    function reverseItem(uint256 itemId) public onlyOwner returns (bool) {
        address ownerOfItem = ownerOf(itemId);
        _transfer(ownerOfItem, address(this), itemId);
        uint pos = 6666;
        for (uint i = 0; i < address2ids[ownerOfItem].length; i++) {
            if (address2ids[ownerOfItem][i] == itemId) {
                pos = i;
                break;
            }
        }
        require(pos != 6666, "reverse item function... item not found in address2ids");
        delete address2ids[ownerOfItem][pos];
        return true;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");
        return string(abi.encodePacked(baseUrl, uint2str(tokenId)));
    }

    function getRanksOfAddress(address _own) public view returns (uint256[] memory) {
        uint256[] memory ids = address2ids[_own];
        uint256[] memory ranks = new uint256[](ids.length);
        if (ids.length != 0) {
            for (uint i = 0; i < ids.length; i++) {
                ranks[i] = title2Rank[ids[i]];
            }
        }
        return ranks;
    }

    function getRankOfId(uint _id) public view returns (uint id) {
        return title2Rank[_id];
    }

    function getIdOfRank(uint _rank) public view returns (uint id) {
        // is supposed to be cheaper compared to having another mapping
        id = 0;
        for (uint i = 0; i < titleCount; i++) {
            if (title2Rank[i] == _rank) {
                id = i;
                break;
            }
        }
        return id;
    }

    function getIdsOfAddress(address _own) public view returns (uint256[] memory ownedIds) {
        return address2ids[_own];
    }


    // functionality to pay out dividends on profits - should be called once per month and has most functionality in the KingdomBank contract
    function payOutDividends() public onlyOwner {
        // we need to do this for every coin, and only if the person owns a title. pay out dividend for staked title amounts only

        // first do dividends of titles
        for (uint i = 0; i < titleCount; i++) {
            // get current owner
            address owner = ownerOf(i);
            // get kgdat, kgddf balance
            uint256 kgdat_amount = kingdomtitles[i].attackPoints;
            uint256 kgddf_amount = kingdomtitles[i].defensePoints;

            payOutSoon.push(PayOutSoon(owner, kgdat_amount, 0));
            payOutSoon.push(PayOutSoon(owner, kgddf_amount, 1));
            }
        }

        // next do the kingdomseedcoin balances
}