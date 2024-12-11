
//pragma solidity ^0.8.19;
//
//import "./NFTCollection.sol"; // 导入您现有的 NFTCollection 合约
//
//contract NFTCollectionFactory {
//    // 存储所有创建的 NFTCollection 合约地址
//    address[] public collections;
//
//    // 事件：记录每次新 NFTCollection 的创建
//    event CollectionCreated(address indexed collectionAddress, string name, string symbol, address indexed creator);
//
//    /**
//     * @dev 创建新的 NFTCollection 实例
//     * @param name NFTCollection 的名称
//     * @param symbol NFTCollection 的符号
//     */
//    function createNFTCollection(string memory name, string memory symbol) public {
//        // 部署新的 NFTCollection 合约
//        NFTCollection newCollection = new NFTCollection(name, symbol);
//        collections.push(address(newCollection)); // 将新合约地址存储在数组中
//
//        emit CollectionCreated(address(newCollection), name, symbol, msg.sender);
//    }
//
//    /**
//     * @dev 获取所有创建的 NFTCollection 合约地址
//     * @return 所有 NFTCollection 合约地址的数组
//     */
//    function getAllCollections() public view returns (address[] memory) {
//        return collections;
//    }
//}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFTCollection.sol";

contract NFTCollectionFactory {
    address[] public collections;

    constructor() {}

    // 部署一个新的 NFT 集合合约
    function createNFTCollection(
        string memory name,
        string memory symbol,
        address owner,
        string memory ipfsUrl
    ) public {
        NFTCollection newCollection = new NFTCollection(
            name,
            symbol,
            owner,
            ipfsUrl
        );
        collections.push(address(newCollection));
    }

    // 获取所有 NFT 合约地址
    function getAllCollections() public view returns (address[] memory) {
        return collections;
    }


}