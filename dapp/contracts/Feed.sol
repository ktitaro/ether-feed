//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Feed {
    event MessageSent(
        address indexed from,
        uint256 timestamp,
        string content
    );

    event NewWinnerArrived();
    event NewNomineeArrived();

    struct Message {
        address from;
        uint256 timestamp;
        string content;
    }

    Message[] private feed;
    uint256 private randomSeed;
    uint256 private totalMessages;
    uint256 private totalWinners;
    uint256 private totalNominees;
    mapping(address => bool) private winners;
    mapping(address => bool) private nominees;

    constructor() payable {
        uint256 balance = address(this).balance;
        randomSeed = (block.timestamp + block.difficulty) % 100;

        console.log("Hi there, I'm contract and I'm smart");
        console.log("My balance: %d", balance);
        console.log("My random seed: %d", randomSeed);
        console.log("Have fun interacting with me :)");
    }

    function sendMessage(string memory message) public {
        totalMessages += 1;
        feed.push(Message(msg.sender, block.timestamp, message));
        emit MessageSent(msg.sender, block.timestamp, message);
        console.log("Incoming message from %s", msg.sender);

        if (nominees[msg.sender]) {
            console.log("%s had been nominated already", msg.sender);
            console.log("you have only one chance to win the prize");
            return;
        }

        totalNominees += 1;
        nominees[msg.sender] = true;
        emit NewNomineeArrived();

        randomSeed = (block.difficulty + block.timestamp + randomSeed) % 100;
        console.log("random seed re-generated: %d", randomSeed);

        if (randomSeed <= 50) {
            console.log("%s won the prize!", msg.sender);

            uint256 prize = 100 gwei;
            uint256 balance = address(this).balance;
            require(balance >= prize, "Not enough assets for the prize!");

            (bool success,) = (msg.sender).call{value: prize}("");
            require(success, "Failed to withdraw money from contract.");

            totalWinners += 1;
            winners[msg.sender] = true;
            emit NewWinnerArrived();
        }
    }

    function getMessages() public view returns (Message[] memory) {
        return feed;
    }

    function getTotalWinners() public view returns (uint256) {
        return totalWinners;
    }

    function getTotalNominees() public view returns (uint256) {
        return totalNominees;
    }
}