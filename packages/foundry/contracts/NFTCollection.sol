// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFTCollection is ERC721URIStorage {
    uint256 public tokenCounter;

    // auction struct
    struct Auction {
        address seller;
        uint256 startingPrice;
        uint256 endTime;
        address highestBidder;
        uint256 highestBid;
        mapping(address => uint256) pendingReturns; // pending refund amount
        address[] bidders;
    }

    Auction public auction;

    address[] public bidders;

    constructor(
        string memory name,
        string memory symbol,
        address owner,
        string memory ipfsUrl
    ) ERC721(name, symbol) {
        uint256 newTokenId = tokenCounter;
        _safeMint(owner, newTokenId);
        _setTokenURI(newTokenId, ipfsUrl);
        tokenCounter += 1;
    }

    /**
        Read contract functions
     */

    // Check if NFT is listed for auction
    function isNFTListed() external view returns (bool) {
        return auction.startingPrice > 0;
    }

    // Get highest bidder
    function getHighestBidder() external view returns (address) {
        return auction.highestBidder;
    }

    // Get highest bid
    function getHighestBid() external view returns (uint256) {
        return auction.highestBid;
    }

    // Get end time
    function getEndTime() external view returns (uint256) {
        return auction.endTime;
    }

    // Get pending refund amount
    function getPendingRefundAmount() external view returns (uint256) {
        return auction.pendingReturns[msg.sender];
    }

    /**
        Write contract functions
     */

    // List NFT for auction
    function listNFT(uint256 startingPrice, uint256 duration) external {
        address owner = ownerOf(0);
        require(owner == msg.sender, "You are not the owner");
        require(startingPrice > 0, "startingPrice must be greater than 0");

        // initialize auction
        auction.seller = owner;
        auction.startingPrice = startingPrice;
        auction.endTime = block.timestamp + duration;
        auction.highestBidder = address(0);
        auction.highestBid = 0;
    }

    function bid() external payable {
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(auction.startingPrice > 0, "No running auction");
        require(
            msg.value > auction.highestBid,
            "There already is a higher bid"
        );
        require(
            msg.value > auction.startingPrice,
            "Bid must be higher than starting price"
        );

        if (auction.highestBid > 0) {
            auction.pendingReturns[auction.highestBidder] += auction.highestBid;
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        // add bidder to list
        bidders.push(msg.sender);
    }

    // end auction
    function endAuction() external {
        require(msg.sender == auction.seller, "You are not the seller");
        require(auction.startingPrice != 0, "No running auction");

        auction.startingPrice = 0;

        // refund all bidders
        for (uint256 i = 0; i < bidders.length; i++) {
            address bidder = bidders[i];
            uint256 refundAmount = auction.pendingReturns[bidder];
            if (refundAmount > 0) {
                auction.pendingReturns[bidder] = 0;
                (bool success, ) = payable(bidder).call{value: refundAmount}(
                    ""
                );
                require(success, "Refund failed");
            }
        }

        if (auction.highestBid > 0) {
            // transfer NFT to highest bidder
            _transfer(auction.seller, auction.highestBidder, 0);

            // transfer money to seller
            payable(auction.seller).transfer(auction.highestBid);
        }

        auction.seller = ownerOf(0);
        auction.startingPrice = 0;
        auction.endTime = 0;
        auction.highestBidder = address(0);
        auction.highestBid = 0;
    }
    // Get current price (highest bid or starting price)
    function getCurrentPrice() external view returns (uint256) {
        if (auction.highestBid > 0) {
            return auction.highestBid; // 返回当前最高出价
        }
        return auction.startingPrice; // 如果没有出价，返回底价
    }

}