pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./KingdomBank.sol";

contract KingdomTitles is ERC721, KingdomBank {
    
    address private _owner;
    
    uint16 constant public totalSupply = 10000;
    uint public attackCooldown = 60 seconds;
    string public baseUrl = "https://www.kingdomcrypto.com/titles/";

    struct KingdomTitle {
        uint attackPoints;
        uint defensePoints;
        uint readyTimeAttack;
    }

    KingdomTitle[totalSupply] public kingdomtitles;

    mapping (uint => uint) public titleId2Rank;
    uint8 internal titleCount;

    mapping (address => uint[]) public address2ids;

    constructor(KingdomSeedCoin kgdsc, KingdomAttackCoin kgdat, KingdomDefenseCoin kgddf) ERC721("Kingdom Titles", "KGD") KingdomBank(kgdsc, kgdat, kgddf) {
        _owner = _msgSender();
        titleCount = 0;
    }

    modifier onlyOwner {
        require(_owner == msg.sender, "fook off");
        _;
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

    function awardItem(address player) public onlyOwner returns (uint256) {
        require(titleCount < totalSupply, "uhoh, no titles available anymore");  

        uint256 newItemId = titleCount + 1;
        _mint(player, newItemId);

        // mark it down in address2ids
        address2ids[player].push(newItemId);

        // then add data to storage
        titleId2Rank[newItemId] = newItemId;
        kingdomtitles[newItemId] = KingdomTitle(0,0,block.timestamp + attackCooldown);

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

    function tokenMetadata(uint256 _tokenId) public view returns (string memory infoUrl) {
        return string(abi.encodePacked(baseUrl, uint2str(_tokenId)));
    }

    function returnRanksOfTitles(address _own) public view returns (uint256[] memory) {
        uint256[] memory ids = address2ids[_own];
        uint256[] memory ranks = new uint256[](ids.length);
        if (ids.length != 0) {
            for (uint i = 0; i < ids.length; i++) {
                ranks[i] = titleId2Rank[ids[i]];
            }
        }
        return ranks;
    }

    function returnIdsOfAddress(address _own) public view returns (uint256[] memory ownedIds) {
        return address2ids[_own];
    }
}