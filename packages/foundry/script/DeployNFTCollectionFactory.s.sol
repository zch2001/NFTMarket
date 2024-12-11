
//pragma solidity ^0.8.0;
//
//import "forge-std/Script.sol";
//import "../contracts/NFTCollectionFactory.sol"; // 确保路径正确
//
//contract DeployNFTCollectionFactory is Script { // 更新为清晰的合约名称
//    function run() external {
//        vm.startBroadcast(); // 开始广播交易
//        new NFTCollectionFactory(); // 部署 NFTCollectionFactory 合约
//        vm.stopBroadcast(); // 停止广播交易
//    }
//}
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/NFTCollectionFactory.sol";
import "./DeployHelpers.s.sol";

contract DeployNFTCollectionFactory is ScaffoldETHDeploy {
    // use `deployer` from `ScaffoldETHDeploy`

    function run() external ScaffoldEthDeployerRunner {
        NFTCollectionFactory nftFactory = new NFTCollectionFactory();
        nftFactory.getAllCollections();
    }
}