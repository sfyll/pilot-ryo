import { RpcProvider, Account, WeierstrassSignatureType } from "starknet";  // Assuming these are the correct imports
import axios from "axios";

import dotenv from "dotenv";
dotenv.config();

import { signTypedDataStarknet } from "../utils/signature";
import { tradeParametersActionDomain, tradeParametersActionTypeLabel, tradeParametersActionTypes } from "../ryo/ryo.types";
import { stringifyBigInts } from "../utils/bigint";

/*
 * Instantiate Wallet Provider pointing to katana client. 
 */
export async function setupDojoProvider():  Promise<Account | null>  { 

    const rpcProvider = new RpcProvider({
        nodeUrl: process.env.RPC_URL,
    });
    
    return new Account(rpcProvider, process.env.USER_ADDRESS as string, process.env.USER_PRIVKEY as string, "1");
}

/*
 * Seismic tracks a nonce for each wallet to avoid replay attacks. Note this is
 * NOT the nonce that Ethereum tracks for the wallet.
 */
async function nonce(walletClient: any) {
    const response = await axios.get(
        `${process.env.ENDPOINT}/authentication/nonce`,
        {
            data: {
                address: walletClient.address,
            },
        },
    );
    if (response.status !== 200) {
        throw new Error(
            "Could not get nonce for address",
            walletClient.account.address,
        );
    }
    return response.data.nonce;
}
 
/*
* Note this is a mock demonstration of signature verification for Starknet.
* During games, we will tie signed data over the player_id, which means that the signer MUST
* sign with the private key associated to the player_id.
*/
async function runDemo() {

    const masterAccount = await setupDojoProvider() as Account;

    let senderNonce = await nonce(masterAccount)

    const tx = {
        nonce: BigInt(senderNonce).toString(),
        player_id: masterAccount.address,
        game_id: '0',

    }

    const signature = await signTypedDataStarknet(masterAccount, tradeParametersActionTypes, tradeParametersActionTypeLabel, tradeParametersActionDomain, tx) as WeierstrassSignatureType;

    const response = await axios.post(`${process.env.ENDPOINT}/trade/tradeParameters`, {
        tx: stringifyBigInts(tx),
        signature: stringifyBigInts(signature),
    });
    if (response.status !== 200) {
        throw new Error("Could not acquire data availability signature");
    }
    console.log("response: ", response.data);
}

(async () => {
    await runDemo();
})();
