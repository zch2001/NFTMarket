"use client";

import { useState } from "react";
import axios from "axios";
import { useAllContracts } from "~~/utils/scaffold-eth/contractsData";
import { useWriteContract, useAccount } from "wagmi";

const CreateNFTCollection = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [nftName, setNftName] = useState("");
    const [nftDescription, setNftDescription] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const { address: walletAddress } = useAccount(); // 获取当前连接的钱包地址
    const contractsData = useAllContracts();
    const nftFactoryContract = contractsData["NFTCollectionFactory"];
    const { writeContract } = useWriteContract();

    const handleImageUpload = async () => {
        if (!imageFile) {
            alert("Please select an image.");
            return null;
        }

        try {
            setIsUploading(true);

            // 上传图片到 IPFS
            const formData = new FormData();
            formData.append("file", imageFile);

            const pinataResponse = await axios.post(
                "https://api.pinata.cloud/pinning/pinFileToIPFS",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`, // Pinata 的 JWT
                    },
                }
            );

            const imageCid = pinataResponse.data.IpfsHash;
            const imageUrl = `ipfs://${imageCid}`;
            console.log("Image uploaded to IPFS:", imageUrl);

            // 创建 JSON 元数据
            const metadata = {
                name: nftName,
                description: nftDescription,
                image: imageUrl,
            };

            // 上传 JSON 元数据到 IPFS
            const metadataResponse = await axios.post(
                "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                metadata,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
                    },
                }
            );

            const metadataCid = metadataResponse.data.IpfsHash;
            const metadataUrl = `ipfs://${metadataCid}`;
            console.log("Metadata uploaded to IPFS:", metadataUrl);

            return metadataUrl;
        } catch (error) {
            console.error("Error uploading to IPFS:", error);
            alert("Error uploading to IPFS. Please try again.");
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleCreateNFT = async () => {
        if (!nftFactoryContract || !nftName || !nftDescription || !imageFile || !walletAddress) {
            alert("Please fill out all fields and connect your wallet.");
            return;
        }

        const metadataUrl = await handleImageUpload();
        if (!metadataUrl) return;

        try {
            const result = await writeContract({
                address: nftFactoryContract.address,
                abi: nftFactoryContract.abi,
                functionName: "createNFTCollection",
                args: [nftName, nftDescription, walletAddress, metadataUrl], // 使用当前钱包地址
            });
            console.log("Transaction sent:", result);

            alert("NFT created successfully!");
        } catch (error) {
            console.error("Error creating NFT:", error);
            alert("Error creating NFT. Please try again.");
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Create NFT</h1>

            <div className="flex flex-col space-y-4">
                <input
                    type="text"
                    className="input input-bordered"
                    placeholder="NFT Name"
                    value={nftName}
                    onChange={(e) => setNftName(e.target.value)}
                />
                <textarea
                    className="textarea textarea-bordered"
                    placeholder="NFT Description"
                    value={nftDescription}
                    onChange={(e) => setNftDescription(e.target.value)}
                />
                <input
                    type="file"
                    className="file-input file-input-bordered"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                <button
                    className={`btn btn-primary ${isUploading ? "loading" : ""}`}
                    onClick={handleCreateNFT}
                    disabled={isUploading}
                >
                    {isUploading ? "Uploading..." : "Create NFT"}
                </button>
            </div>
        </div>
    );
};

export default CreateNFTCollection;
