import { RpcProvider, Account, WeierstrassSignatureType } from "starknet";  // Assuming these are the correct imports
import axios from "axios";

import dotenv from "dotenv";
dotenv.config();

import { signTypedDataStarknet } from "../utils/signature";
import { size } from "viem";

export async function setupDojoProvider():  Promise<Account | null>  { 

    const rpcProvider = new RpcProvider({
        nodeUrl: "http://localhost:5050",
    });

    const tp = await rpcProvider.getChainId()


    return new Account(rpcProvider, process.env.USER_ADDRESS as string, process.env.USER_PRIVKEY as string, "1");
}

const masterAccount = await setupDojoProvider() as Account;

const message = {
    player_id: '0x5672693c3687ebdedda032c23eee53a270225700fde9303081197666c718bc4',
    game_id: '0'
}


// Function to send signature to your endpoint
// async function sendSignatureToEndpoint(signature: WeierstrassSignatureType, address: string, tradeParametersActionTypes, tradeParametersActionTypeLabel, tradeParametersActionDomain, message) {
//     const url = `http://localhost:3000/authentication/action`; // Adjust the domain and port as necessary

//     try {
//         const response = await fetch(url, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 // Include other headers as required, like authentication tokens
//             },
//             body: JSON.stringify({
//                 signature: signature,
//                 // Include other body parameters as required
//             }),
//         });

//         if (!response.ok) {
//             throw new Error(`Error: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log('Response from server:', data);
//     } catch (error) {
//         console.error('Error sending signature to endpoint:', error);
//     }
// }

// // Use this function where you want to send the signature
// await sendSignatureToEndpoint(signature);



// const signature = await signTypedDataStarknet(masterAccount.signer, masterAccount.address, tradeParametersActionTypes, tradeParametersActionTypeLabel, tradeParametersActionDomain, message) as WeierstrassSignatureType;

// console.log("signature: ", signature)


/*
 * Seismic tracks a nonce for each wallet to avoid replay attacks. Note this is
 * NOT the nonce that Ethereum tracks for the wallet.
 */
async function nonce(walletClient: any) {
    console.log(walletClient.address)
    console.log(size(walletClient))
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

const nonceVal = await nonce(masterAccount)

console.log(nonceVal)
