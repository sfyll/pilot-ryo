import { RpcProvider, Account, WeierstrassSignatureType } from "starknet";  // Assuming these are the correct imports

import dotenv from "dotenv";
dotenv.config();

import {
    tradeParametersActionTypeLabel,
    tradeParametersActionTypes,
    tradeParametersActionDomain,
} from "../authentication/authentication.types";
import { signTypedDataStarknet } from "../utils/signature";

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


const signature = await signTypedDataStarknet(masterAccount.signer, masterAccount.address, tradeParametersActionTypes, tradeParametersActionTypeLabel, tradeParametersActionDomain, message) as WeierstrassSignatureType;

console.log("signature: ", signature)
