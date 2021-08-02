// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract MIDIMarket is ReentrancyGuard {
    address payable owner;

    constructor() {
        owner = payable(msg.sender);
    }
}
