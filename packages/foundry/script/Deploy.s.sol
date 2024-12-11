//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import {DeployNFTCollectionFactory} from "./DeployNFTCollectionFactory.s.sol";
import {DeployNFT} from "./DeployNFT.s.sol";

contract DeployScript is ScaffoldETHDeploy {
  function run() external {

    DeployNFTCollectionFactory deployFactory = new DeployNFTCollectionFactory();
    deployFactory.run();

    DeployNFT deployNFT = new DeployNFT();
    deployNFT.run();
  }
}