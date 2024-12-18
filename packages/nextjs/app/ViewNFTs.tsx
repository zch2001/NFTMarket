"use client";

import { useState } from "react";
import { useAllContracts } from "~~/utils/scaffold-eth/contractsData";
import { useAccount, useWriteContract } from "wagmi";
import { createPublicClient, http } from "viem";
import { vMainnet } from "~~/utils/customChains";

const ViewNFTs = () => {
    const [nfts, setNfts] = useState<
        { collection: string; tokenId: string; tokenURI: string; image?: string; name?: string; description?: string }[]
    >([]);
    const [selectedNFT, setSelectedNFT] = useState<null | { collection: string; tokenId: string }>(null);
    const [price, setPrice] = useState<string>(""); // 上架价格
    const [isLoading, setIsLoading] = useState(false);
    const { address: walletAddress } = useAccount();
    const contractsData = useAllContracts();
    const { writeContract } = useWriteContract();

    // 设置 viem 的 HTTP 传输层
    const client = createPublicClient({
        chain: vMainnet,
        transport: http("https://virtual.mainnet.rpc.tenderly.co/7ba28415-e7ad-4abd-99c8-89c59edb98cc"),
    });

    const fetchNFTs = async () => {
        if (!walletAddress || !contractsData["NFTCollectionFactory"]) return;

        try {
            setIsLoading(true);
            const collections = await client.readContract({
                address: contractsData["NFTCollectionFactory"].address as `0x${string}`,
                abi: contractsData["NFTCollectionFactory"].abi,
                functionName: "getAllCollections",
            });

            const ownedNFTs: typeof nfts = [];

            for (const collection of collections as string[]) {
                try {
                    const owner = await client.readContract({
                        address: collection as `0x${string}`,
                        abi: [
                            {
                                type: "function",
                                name: "ownerOf",
                                stateMutability: "view",
                                inputs: [{ name: "tokenId", type: "uint256" }],
                                outputs: [{ name: "", type: "address" }],
                            },
                        ],
                        functionName: "ownerOf",
                        args: [BigInt(0)], // 每个合约只有一个 NFT，TokenID 固定为 0
                    });

                    if (owner.toLowerCase() === walletAddress.toLowerCase()) {
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

                        // 解码 TokenURI
                        const response = await fetch((tokenURI as string).replace("ipfs://", "https://ipfs.io/ipfs/"));
                        const metadata = await response.json();

                        ownedNFTs.push({
                            collection,
                            tokenId: "0", // 固定为 0
                            tokenURI: tokenURI as string,
                            image: metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
                            name: metadata.name,
                            description: metadata.description,
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching NFT from collection ${collection}:`, error);
                }
            }

            setNfts(ownedNFTs);
        } catch (error) {
            console.error("Error fetching NFTs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleListNFT = async () => {
        if (!selectedNFT || !price) {
            alert("Please select an NFT and enter a valid price.");
            return;
        }

        try {
            setIsLoading(true);
            const tx = await writeContract({
                address: selectedNFT.collection as `0x${string}`,
                abi: contractsData["NFTCollection"].abi,
                functionName: "listNFT",
                args: [BigInt(selectedNFT.tokenId), BigInt(price) * 10n ** 18n], // 价格转为 wei
            });

            console.log("Transaction sent:", tx);
            alert("NFT listed successfully!");
        } catch (error) {
            console.error("Error listing NFT:", error);
            alert("Error listing NFT. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">My NFTs</h1>
            <div className="flex space-x-4 mb-4">
                <button
                    className="btn btn-primary"
                    onClick={fetchNFTs}
                    disabled={isLoading}
                >
                    {isLoading ? "Loading..." : "Fetch My NFTs"}
                </button>
            </div>
            {nfts.length === 0 ? (
                <p>No NFTs found in your wallet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nfts.map((nft, index) => (
                        <div
                            key={`${nft.collection}-${nft.tokenId}-${index}`}
                            className={`border p-4 rounded shadow ${selectedNFT?.collection === nft.collection ? "border-blue-500" : ""}`}
                            onClick={() => setSelectedNFT({ collection: nft.collection, tokenId: nft.tokenId })}
                        >
                            <p className="text-sm font-bold">Collection: {nft.collection}</p>
                            <p className="text-sm">Token ID: {nft.tokenId}</p>
                            {nft.image ? (
                                <img src={nft.image} alt={nft.name} className="w-full h-auto" />
                            ) : (
                                <p className="text-sm italic">Image not available</p>
                            )}
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
                    <input
                        type="number"
                        placeholder="Enter price (ETH)"
                        className="input input-bordered mb-4"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                    <button
                        className="btn btn-success"
                        onClick={handleListNFT}
                        disabled={isLoading}
                    >
                        {isLoading ? "Listing..." : "List NFT"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ViewNFTs;
