pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract KingdomSeedCoin is ERC20("KingdomSeeds", "KGDS") {
    uint private initialSupply = 1000000000000000000000000; // 1 million
    
    constructor() {
        _mint(msg.sender, initialSupply);
    }
}