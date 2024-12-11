"use client";

import { useState } from "react";
import { useAllContracts } from "~~/utils/scaffold-eth/contractsData";
import { useWriteContract } from "wagmi";

const CreateNFTCollection = () => {
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [ipfsUrl, setIpfsUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false); // 手动管理加载状态

    const contractsData = useAllContracts();
    const nftFactoryContract = contractsData["NFTCollectionFactory"];
    const nftFactoryAddress = nftFactoryContract?.address;

    const { writeContract, data } = useWriteContract();

    const handleCreate = async () => {
        if (nftFactoryContract && nftFactoryAddress) {
            try {
                setIsSubmitting(true); // 开始加载
                const result = await writeContract({
                    address: nftFactoryAddress,
                    abi: nftFactoryContract.abi, // 动态加载工厂合约的 ABI
                    functionName: "createNFTCollection",
                    args: [name, symbol, "0xb3af365c3f3f6aaae872cf0e3197747d23078f56", ipfsUrl],
                });
                console.log("Transaction sent:", result); // 打印交易信息
                alert("NFT Collection created successfully!");
            } catch (error) {
                console.error("Error creating NFT Collection:", error);
                alert("Failed to create NFT Collection. Check console for details.");
            } finally {
                setIsSubmitting(false); // 停止加载
            }
        } else {
            alert("Factory contract not found.");
        }
    };

    return (
        <div className="flex flex-col items-center p-4">
            <h2 className="text-2xl font-bold mb-4">Create NFT Collection</h2>
            <input
                type="text"
                placeholder="Collection Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered mb-2"
            />
            <input
                type="text"
                placeholder="Symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="input input-bordered mb-2"
            />
            <input
                type="text"
                placeholder="IPFS URL"
                value={ipfsUrl}
                onChange={(e) => setIpfsUrl(e.target.value)}
                className="input input-bordered mb-2"
            />
            <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={isSubmitting} // 手动管理按钮状态
            >
                {isSubmitting ? "Creating..." : "Create Collection"}
            </button>
        </div>
    );
};

export default CreateNFTCollection;
