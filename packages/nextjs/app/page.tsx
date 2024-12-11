"use client";

import { useRouter } from "next/navigation";

const HomePage = () => {
    const router = useRouter();

    const handleNavigateToCreateNFT = () => {
        router.push("/CreateNFTCollection");
    };

    const handleNavigateToViewNFTs = () => {
        router.push("/ViewNFTs");
    };

    const handleNavigateToMarket = () => {
        router.push("/Market");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 text-base-content">
            <h1 className="text-4xl font-bold mb-8">Welcome to My NFT DApp</h1>
            <p className="text-lg text-center mb-12">
                Discover, create, explore, and trade NFTs with ease!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                    onClick={handleNavigateToCreateNFT}
                    className="btn btn-primary w-full"
                >
                    Create NFTs
                </button>
                <button
                    onClick={handleNavigateToViewNFTs}
                    className="btn btn-secondary w-full"
                >
                    View My NFTs
                </button>
                <button
                    onClick={handleNavigateToMarket}
                    className="btn btn-accent w-full"
                >
                    Go to Marketplace
                </button>
            </div>
        </div>
    );
};

export default HomePage;
