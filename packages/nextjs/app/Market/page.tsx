"use client";

import { useState, useEffect } from "react";
import { useAllContracts } from "~~/utils/scaffold-eth/contractsData";
import { createPublicClient, http } from "viem";
import { vMainnet } from "~~/utils/customChains";
import { useAccount, useWriteContract } from "wagmi";

const Market = () => {
    const [collections, setCollections] = useState<string[]>([]);
    const [marketNFTs, setMarketNFTs] = useState<
        {
            collection: string;
            tokenId: string;
            tokenURI: string;
            image?: string;
            name?: string;
            description?: string;
            price?: number; // Current market price
            endTime?: number; // Auction end time (timestamp)
        }[]
    >([]);
    const [selectedNFT, setSelectedNFT] = useState<null | { collection: string; tokenId: string; price: number; endTime?: number }>(null);
    const [bidAmount, setBidAmount] = useState<string>(""); // User bid amount
    const [isLoading, setIsLoading] = useState(false);
    const contractsData = useAllContracts();
    const { writeContract } = useWriteContract();
    const { address: walletAddress } = useAccount();

    const client = createPublicClient({
        chain: vMainnet,
        transport: http("https://virtual.mainnet.rpc.tenderly.co/bb8f15de-7875-43f9-aa03-ab1c1772da1b"),
    });

    const fetchCollections = async () => {
        const nftFactoryContract = contractsData["NFTCollectionFactory"];
        if (!nftFactoryContract) return;

        try {
            setIsLoading(true);
            const collections = await client.readContract({
                address: nftFactoryContract.address as `0x${string}`,
                abi: nftFactoryContract.abi,
                functionName: "getAllCollections",
            });
            setCollections(collections as string[]);
        } catch (error) {
            console.error("Error fetching collections:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMarketNFTs = async () => {
        if (collections.length === 0) return;
        setIsLoading(true);
        const nftsTemp: typeof marketNFTs = [];

        for (const collection of collections) {
            try {
                const isListed = await client.readContract({
                    address: collection as `0x${string}`,
                    abi: contractsData["NFTCollection"].abi,
                    functionName: "isNFTListed",
                });

                if (isListed) {
                    const tokenURI = await client.readContract({
                        address: collection as `0x${string}`,
                        abi: contractsData["NFTCollection"].abi,
                        functionName: "tokenURI",
                        args: [BigInt(0)],
                    });

                    const price = await client.readContract({
                        address: collection as `0x${string}`,
                        abi: contractsData["NFTCollection"].abi,
                        functionName: "getCurrentPrice",
                    });

                    const endTime = await client.readContract({
                        address: collection as `0x${string}`,
                        abi: contractsData["NFTCollection"].abi,
                        functionName: "getEndTime",
                    });

                    if (typeof tokenURI === "string") {
                        const response = await fetch(tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/"));
                        const metadata = await response.json();

                        nftsTemp.push({
                            collection,
                            tokenId: "0",
                            tokenURI,
                            image: metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
                            name: metadata.name,
                            description: metadata.description,
                            price: price ? Number(price) / 1e18 : undefined,
                            endTime: Number(endTime), // Add auction end time
                        });
                    } else {
                        console.error("Invalid tokenURI type:", tokenURI);
                    }
                }
            } catch (error) {
                console.error(`Error fetching market NFTs from collection ${collection}:`, error);
            }
        }

        setMarketNFTs(nftsTemp);
        setIsLoading(false);
    };

    const handleBid = async () => {
        if (!selectedNFT || !bidAmount) {
            alert("Please select an NFT and enter a valid bid amount.");
            return;
        }

        const bidValue = parseFloat(bidAmount); // Convert input to number
        if (isNaN(bidValue) || bidValue <= 0) {
            alert("Please enter a valid bid amount.");
            return;
        }

        try {
            setIsLoading(true);
            const result = await writeContract({
                address: selectedNFT.collection as `0x${string}`,
                abi: contractsData["NFTCollection"].abi,
                functionName: "bid",
                args: [], // No additional arguments needed
                value: BigInt(Math.floor(bidValue * 1e18)), // Convert to Wei
            });
            console.log("Bid placed successfully:", result);
            alert("Bid placed successfully!");
        } catch (error) {
            console.error("Error placing bid:", error);
            alert("Failed to place bid. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    useEffect(() => {
        fetchMarketNFTs();
    }, [collections]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">NFT Market</h1>
            <div className="flex space-x-4 mb-4">
                <button
                    className="btn btn-primary"
                    onClick={fetchCollections}
                    disabled={isLoading}
                >
                    {isLoading ? "Loading Collections..." : "Fetch Collections"}
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={fetchMarketNFTs}
                    disabled={isLoading || collections.length === 0}
                >
                    {isLoading ? "Loading Market NFTs..." : "Fetch Market NFTs"}
                </button>
            </div>
            {marketNFTs.length === 0 ? (
                <p>No NFTs listed in the market.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {marketNFTs.map((nft, index) => (
                        <div
                            key={index}
                            className={`border p-4 rounded shadow ${
                                selectedNFT?.collection === nft.collection ? "border-blue-500" : ""
                            }`}
                            onClick={() => setSelectedNFT({ collection: nft.collection, tokenId: nft.tokenId, price: nft.price || 0, endTime: nft.endTime })}
                        >
                            <p className="text-sm font-bold">Collection: {nft.collection}</p>
                            <p className="text-sm">Token ID: {nft.tokenId}</p>
                            {nft.price && <p className="text-sm text-green-600">Current Price: {nft.price} ETH</p>}
                            {nft.endTime && (
                                <p className="text-sm text-red-500">
                                    Ends In: {Math.max(0, Math.floor((nft.endTime * 1000 - Date.now()) / 1000))} seconds
                                </p>
                            )}
                            {nft.image && <img src={nft.image} alt={nft.name} className="w-full h-auto" />}
                            {nft.name && <p className="text-sm font-bold">{nft.name}</p>}
                            {nft.description && <p className="text-sm">{nft.description}</p>}
                        </div>
                    ))}
                </div>
            )}
            {selectedNFT && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Selected NFT</h2>
                    <p>Collection: {selectedNFT.collection}</p>
                    <p>Token ID: {selectedNFT.tokenId}</p>
                    <p>Current Price: {selectedNFT.price} ETH</p>
                    <p>
                        Ends In:{" "}
                        {selectedNFT.endTime
                            ? Math.max(0, Math.floor((selectedNFT.endTime * 1000 - Date.now()) / 1000))
                            : "Unknown"}{" "}
                        seconds
                    </p>
                    <input
                        type="number"
                        placeholder="Enter bid amount (ETH)"
                        className="input input-bordered mb-4"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                    />
                    <button
                        className="btn btn-success"
                        onClick={handleBid}
                        disabled={
                            Boolean(
                                isLoading ||
                                parseFloat(bidAmount) <= (selectedNFT?.price || 0) ||
                                (selectedNFT.endTime && Date.now() >= selectedNFT.endTime * 1000)
                            )
                        }
                    >
                        {isLoading ? "Placing Bid..." : "Place Bid"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Market;
