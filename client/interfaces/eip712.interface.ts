export interface EIP712DomainType {
    name: string;
    version: string | undefined;
    chainId: number;
    verifyingContract: string;
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
        EIP712Domain: EIP712DomainSpec,
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
