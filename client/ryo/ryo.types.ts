import dotenv from "dotenv";
dotenv.config();

import {
    createStarknetEIP712DomainType, 
    createEIP712TypesNoBodyStarknet,
} from "../interfaces/eip712.interface";
import { StarkNetDomain, TypedData } from "starknet";
import { RequestWithBody } from "../interfaces/request.interface";

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

export type Trade = {
    nonce: string;
    player_id: number;
    game_id: number;
    location_id:number; 
    drug_id: number;
    cash: number;
    quantity: number;
}

export type RequestWithTrade = RequestWithBody<Trade>

export const TradeTypes = [
    nonce,
    { name: "player_id", type: "felt" },
    { name: "game_id", type: "felt" },
    { name: "drug_id", type: "felt" },
    { name: "reserve_in", type: "felt" },
    { name: "reserve_out", type: "felt" },
]

export const tradeActionTypeLabel = "Trade";
export const tradeActionTypes = createEIP712TypesNoBodyStarknet(tradeActionTypeLabel, TradeTypes);
export const tradeActionDomain = createStarknetEIP712DomainType("Trade Request");

export const tradeDAReqTyped = getStarknetTypedData(tradeActionTypes, tradeActionTypeLabel, tradeActionDomain)
