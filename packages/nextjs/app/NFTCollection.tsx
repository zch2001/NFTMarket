"use client";

import { useState } from "react";
import { useAccount, useSimulateContract, useWriteContract } from "wagmi";

const CreateNFTCollection = () => {
    const { address: connectedAddress } = useAccount();
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [ipfsUrl, setIpfsUrl] = useState("");

    const { data } = useSimulateContract({
        address: "0xYourNFTCollectionFactoryAddress", // 替换为实际合约地址
        abi: [
            {
                type: "function",
                name: "createNFTCollection",
                stateMutability: "nonpayable",
                inputs: [
                    { name: "name", type: "string" },
                    { name: "symbol", type: "string" },
                    { name: "owner", type: "address" },
                    { name: "ipfsUrl", type: "string" },
                ],
                outputs: [],
            },
        ],
        functionName: "createNFTCollection",
        args: [name, symbol, connectedAddress!, ipfsUrl],
    });

    const { writeContract } = useWriteContract();

    const handleCreate = () => {
        if (data?.request) {
            writeContract(data.request);
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
                disabled={!data?.request}
            >
                Create Collection
            </button>
        </div>
    );
};

export default CreateNFTCollection;
