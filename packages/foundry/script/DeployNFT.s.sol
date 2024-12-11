//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/NFTCollection.sol";
import "./DeployHelpers.s.sol";

contract DeployNFT is ScaffoldETHDeploy {
    // use `deployer` from `ScaffoldETHDeploy`

    function run() external ScaffoldEthDeployerRunner {
        NFTCollection nft = new NFTCollection(
            "MyNFT",
            "MNFT",
            0xE879A12A1A3eBEdC98fa5B605a09cb3FfEcD929B,
            "https://ipfs.io/ipfs/QmQ3CTUkPRmWhjwcvbd5L17hJjvUgxBRoGzw1kqSAi1QMd"
        );
    }
}