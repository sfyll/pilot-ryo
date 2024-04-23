import dotenv from "dotenv";
dotenv.config();

import {
    createEIP712Types,
    createEIP712DomainType,
} from "../interfaces/eip712.interface";

export const nonceActionTypeLabel = "Nonce";
export let nonceActionTypes = createEIP712Types(nonceActionTypeLabel, []);
export const nonceActionDomain = createEIP712DomainType("Tomo Nonce Action");