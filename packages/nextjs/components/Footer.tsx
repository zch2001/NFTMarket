import React from "react";
import Link from "next/link";
import { hardhat } from "viem/chains";
import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
      <div className="min-h-0 py-5 px-4">
        <div className="w-full">
          <ul className="menu menu-horizontal w-full flex justify-center items-center">
            <div className="flex justify-center items-center gap-4 text-sm w-full">
              {/* Left Section */}
              {nativeCurrencyPrice > 0 && (
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    <span>{nativeCurrencyPrice.toFixed(2)}</span>
                  </div>
              )}
              {isLocalNetwork && (
                  <>
                    <Faucet />
                    <Link href="/blockexplorer" passHref className="btn btn-primary btn-sm font-normal gap-1">
                      <MagnifyingGlassIcon className="h-4 w-4" />
                      <span>Block Explorer</span>
                    </Link>
                  </>
              )}

              {/* Middle Section */}
              <div className="flex items-center gap-2 text-center">
                <a href="https://github.com/zch2001/NFTMarket" target="_blank" rel="noreferrer" className="link">
                  Fork me
                </a>
                <span>·</span>
                <p className="m-0 text-center">
                  Built with <HeartIcon className="inline-block h-4 w-4" /> Scaffold-ETH
                </p>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2">
                <span>·</span>
                <a
                    href="https://dashboard.tenderly.co/Chuhan/7500/testnet/c4d2e458-caf5-41b7-b219-dc89d7626d36"
                    target="_blank"
                    rel="noreferrer"
                    className="link"
                >
                  Dashboard
                </a>
              </div>
            </div>
          </ul>
        </div>

        {/* Theme Switch */}
        <div className="flex justify-center mt-4">
          <SwitchTheme />
        </div>
      </div>
  );
};
