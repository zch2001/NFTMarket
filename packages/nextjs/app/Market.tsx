"use client";

import { useState, useEffect } from "react";
import { useAllContracts } from "~~/utils/scaffold-eth/contractsData";
import { createPublicClient, http } from "viem";
import { vMainnet } from "~~/utils/customChains";

const Market = () => {
    const [collections, setCollections] = useState<string[]>([]);
    const [marketNFTs, setMarketNFTs] = useState<
        { collection: string; tokenId: string; tokenURI: string; image?: string; name?: string; description?: string; price?: number }[]
    >([]);
    const [isLoading, setIsLoading] = useState(false); // 控制加载状态
    const contractsData = useAllContracts();

    const client = createPublicClient({
        chain: vMainnet,
        transport: http("https://virtual.mainnet.rpc.tenderly.co/7ba28415-e7ad-4abd-99c8-89c59edb98cc"),
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
        const nftsTemp: { collection: string; tokenId: string; tokenURI: string; image?: string; name?: string; description?: string; price?: number }[] = [];

        for (const collection of collections) {
            try {
                const isListed = await client.readContract({
                    address: collection as `0x${string}`,
                    abi: contractsData["NFTCollection"].abi,
                    functionName: "isNFTListed",
                    args: [BigInt(0)],
                });

                if (isListed) {
                    const tokenURI = await client.readContract({
                        address: collection as `0x${string}`,
                        abi: [
                            {
                                type: "function",
                                name: "tokenURI",
                                stateMutability: "view",
                                inputs: [{ name: "tokenId", type: "uint256" }],
                                outputs: [{ name: "", type: "string" }],
                            },
                        ],
                        functionName: "tokenURI",
                        args: [BigInt(0)],
                    });

                    const price = await client.readContract({
                        address: collection as `0x${string}`,
                        abi: contractsData["NFTCollection"].abi,
                        functionName: "getNFTPrice",
                        args: [BigInt(0)],
                    });

                    // 解码 tokenURI
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
                    });
                }
            } catch (error) {
                console.error(`Error fetching market NFTs from collection ${collection}:`, error);
            }
        }

        setMarketNFTs(nftsTemp);
        setIsLoading(false);
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
                        <div key={index} className="border p-4 rounded shadow">
                            <p className="text-sm font-bold">Collection: {nft.collection}</p>
                            <p className="text-sm">Token ID: {nft.tokenId}</p>
                            {nft.price && <p className="text-sm text-green-600">Price: {nft.price} ETH</p>}
                            {nft.image && <img src={nft.image} alt={nft.name} className="w-full h-auto" />}
                            {nft.name && <p className="text-sm font-bold">{nft.name}</p>}
                            {nft.description && <p className="text-sm">{nft.description}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Market;
