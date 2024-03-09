import dotenv from "dotenv";
dotenv.config();

import {
    createEIP712Types,
    createEIP712DomainType,
} from "../interfaces/eip712.interface";

export const TradeParametersTypes = [
    { name: "player_id", type: "felt" },
    { name: "game_id", type: "felt" }
];

export const tradeParametersActionTypeLabel = "TradeParameters";
export let tradeParametersActionTypes = createEIP712Types(tradeParametersActionTypeLabel, TradeParametersTypes);
export const tradeParametersActionDomain = createEIP712DomainType("Trade Parameters Action");



