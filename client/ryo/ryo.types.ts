import dotenv from "dotenv";
dotenv.config();

import {
    createStarknetEIP712DomainType, 
    createEIP712TypesNoBodyStarknet,
} from "../interfaces/eip712.interface";
import { StarkNetDomain, TypedData } from "starknet";

/*
 * helper function to construct TypedData as specified in EIP712.
 */
export function getStarknetTypedData(
    types: any,
    primaryType: string, 
    domain:  StarkNetDomain,
): {types: any, primaryType: string, domain: StarkNetDomain }   {
    return {
        types, 
        primaryType, 
        domain,
    }
}

/*
 * helper function to construct TypedData as specified in EIP712, including the message.
 */
export function getStarknetTypedDataWithMessage(
    types: any,
    primaryType: string, 
    domain:  StarkNetDomain,
    message: any,
): TypedData {
    const typedDataWithoutMessage = getStarknetTypedData(types, primaryType, domain)
    return {
        ...typedDataWithoutMessage,
        message
    }
}
export const nonce = { name: "nonce", type: "felt"};


export const TradeParametersTypes = [
    nonce,
    { name: "player_id", type: "felt" },
    { name: "game_id", type: "felt" }
];

export const tradeParametersActionTypeLabel = "TradeParameters";
export const tradeParametersActionTypes = createEIP712TypesNoBodyStarknet(tradeParametersActionTypeLabel, TradeParametersTypes);
export const tradeParametersActionDomain = createStarknetEIP712DomainType("Trade Parameters Request");

export const tradeParametersDAReqTyped = getStarknetTypedData(tradeParametersActionTypes, tradeParametersActionTypeLabel, tradeParametersActionDomain)


