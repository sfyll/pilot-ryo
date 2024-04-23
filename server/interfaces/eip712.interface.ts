import { shortString } from "starknet";

export interface EIP712DomainType {
    name: string;
    version: string | undefined;
    chainId: number;
    verifyingContract: string;
}

export interface StarknetEIP712DomainType {
    name: string;
    version: string | undefined;
    chainId: number;
}

interface EIP712DomainTypeElement {
    name: string;
    type: string;
}
export interface EIP712Types {
    EIP712Domain: EIP712DomainTypeElement[];
    [key: string]: any;
}

export const EIP712DomainSpec = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
];

export const EIP712DomainSpecStarknet = [
    { name: "name", type: "felt" },
    { name: "version", type: "felt" },
    { name: "chainId", type: "felt" },
];

/*
 * Enforces a body + wrapper type structure for incoming requests. The body
 * holds request-specific info while the wrapper holds the nonce.
 */
export function createEIP712Types(
    bodyType: string,
    bodySpec: { name: string; type: string }[],
) {
    return {
        EIP712Domain: EIP712DomainSpec,
        [bodyType]: bodySpec,
        [`${bodyType}Tx`]: [
            { name: "body", type: bodyType },
        ],
    };
}

/*
 * A streamlined version of createEIP712Types() that doesn't enforce having a
 * wrapper tx object.
 */
export function createEIP712TypesNoBody(
    name: string,
    spec: { name: string; type: string }[],
) {
    return {
        EIP712Domain: EIP712DomainSpecStarknet,
        [name]: spec,
    };
}

/*
 * Starknet typing rigidity prevent us from using nested typing definitions. As such,
*  so-called NoBody structures are privileged.
 */
export function createEIP712TypesNoBodyStarknet(
    name: string,
    spec: { name: string; type: string }[],
) {
    return {
        StarkNetDomain: EIP712DomainSpecStarknet,
        [name]: spec,
    };
}
/*
 * All the domain separators used in signing typed data.
 */
export function createEIP712DomainType(name: string) {
    return {
        name,
        version: process.env.VERSION,
        chainId: process.env.CHAIN_ID?.startsWith('0x') ? parseInt(process.env.CHAIN_ID, 16) : Number(process.env.CHAIN_ID),
        verifyingContract: `0x${process.env.CONTRACT_ADDR}`,
    };
}

/*
 * All the domain separators used in signing typed data, for starknet.
 */
export function createStarknetEIP712DomainType(name: string) {
    return { 
        name,
        version: process.env.VERSION,
        chainId: typeof process.env.CHAIN_ID === 'string' ? shortString.encodeShortString(process.env.CHAIN_ID) : Number(process.env.CHAIN_ID),
    };
}
