//// SPDX-License-Identifier: MIT
//pragma solidity ^0.8.19;
//
//import "forge-std/Test.sol";
//import "../contracts/NFTCollection.sol";
//
//contract TestNFTCollection is Test {
//    NFTCollection nftCollection;
//
//    function setUp() public {
//        // 初始化测试合约
//        nftCollection = new NFTCollection("Test Collection", "TEST");
//    }
//
//    function testMintNFT() public {
//        // 设置测试数据
//        string memory ipfsUrl = "ipfs://example-metadata";
//        address recipient = address(0x123);
//
//        // 铸造 NFT
//        uint256 tokenId = nftCollection.mintNFT(recipient, ipfsUrl);
//
//        // 验证 tokenId 是否正确
//        assertEq(tokenId, 0, "First token ID should be 0");
//
//        // 验证 NFT 所有权
//        address owner = nftCollection.ownerOf(tokenId);
//        assertEq(owner, recipient, "Recipient should be the owner of the token");
//
//        // 验证 Token URI 是否正确
//        string memory returnedUri = nftCollection.getTokenURI(tokenId);
//        assertEq(returnedUri, ipfsUrl, "Token URI should match the provided IPFS URL");
//    }
//
//    function testTokenURI() public {
//        // 设置测试数据
//        string memory ipfsUrl = "ipfs://example-metadata";
//        address recipient = address(this);
//
//        // 铸造 NFT
//        uint256 tokenId = nftCollection.mintNFT(recipient, ipfsUrl);
//
//        // 验证 getTokenURI 是否返回正确的元数据
//        string memory returnedUri = nftCollection.getTokenURI(tokenId);
//        assertEq(returnedUri, ipfsUrl, "Token URI should match the input IPFS URL");
//    }
//
//    function testMintMultipleNFTs() public {
//        // 铸造多个 NFT
//        string memory ipfsUrl1 = "ipfs://metadata-1";
//        string memory ipfsUrl2 = "ipfs://metadata-2";
//        address recipient = address(0x456);
//
//        uint256 tokenId1 = nftCollection.mintNFT(recipient, ipfsUrl1);
//        uint256 tokenId2 = nftCollection.mintNFT(recipient, ipfsUrl2);
//
//        // 验证 tokenId 是否递增
//        assertEq(tokenId1, 0, "First token ID should be 0");
//        assertEq(tokenId2, 1, "Second token ID should be 1");
//
//        // 验证所有权
//        assertEq(nftCollection.ownerOf(tokenId1), recipient, "Owner of tokenId 0 should match");
//        assertEq(nftCollection.ownerOf(tokenId2), recipient, "Owner of tokenId 1 should match");
//
//        // 验证元数据
//        assertEq(nftCollection.getTokenURI(tokenId1), ipfsUrl1, "Token 0 URI should match");
//        assertEq(nftCollection.getTokenURI(tokenId2), ipfsUrl2, "Token 1 URI should match");
//    }
//
//}
