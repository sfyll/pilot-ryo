import dotenv from "dotenv";
dotenv.config();

import {
    createStarknetEIP712DomainType,
    createEIP712TypesNoBody,
} from "../interfaces/eip712.interface";

export const TradeParametersTypes = [
    { name: "player_id", type: "felt" },
    { name: "game_id", type: "felt" }
];

export const tradeParametersActionTypeLabel = "TradeParameters";
export let tradeParametersActionTypes = createEIP712TypesNoBody(tradeParametersActionTypeLabel, TradeParametersTypes);
export const tradeParametersActionDomain = createStarknetEIP712DomainType("Trade Parameters Action");



