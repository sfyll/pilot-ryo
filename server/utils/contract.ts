import {
    parseAbiItem,
    createWalletClient,
    createPublicClient,
    http,
    webSocket,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry, arbitrumSepolia } from "viem/chains";

const CHAIN = process.env.CHAIN;
const chain = CHAIN === "arbitrum-sepolia" ? arbitrumSepolia : foundry;

/*
 * ABIs for all events on the contract that we are interested in listening for.
 */
export const EventABIs = {
    RegisteredSwipe: parseAbiItem(
        "event RegisteredSwipe(address owner, uint256 commitment)",
    ),
};

/*
 * Sets up an interface to the Swipe contract using Viem.
 */
export function contractInterfaceSetup(privKey: string): [any, any] {
    const account = privateKeyToAccount(`0x${privKey}`);
    const walletClient = createWalletClient({
        account,
        chain: chain,
        transport: http(process.env.RPC_URL),
    });
    const publicClient = createPublicClient({
        chain: chain,
        transport: webSocket(process.env.RPC_URL_WSS),
    });
    return [walletClient, publicClient];
}

/*
 * Call await on the returned promise to sleep for N seconds.
 */
export function sleep(N: number) {
    return new Promise((resolve) => setTimeout(resolve, N * 1000));
}

