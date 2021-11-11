pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract KingdomAttackCoin is ERC20("Kingdom Attack Coins", "KGDAT") {
    uint private initialSupply = 1000000000000000000000000; // 1 million
    
    constructor() {
        _mint(msg.sender, initialSupply);
    }
}