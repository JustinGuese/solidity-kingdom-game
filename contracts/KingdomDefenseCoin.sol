pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract KingdomDefenseCoin is ERC20("Kingdom Defense Coins", "KGDDF") {
    uint private initialSupply = 1000000000000000000000000; // 1 million
    
    constructor() {
        _mint(msg.sender, initialSupply);
    }
}