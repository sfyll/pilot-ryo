import { Account, Signature, StarkNetDomain, WeierstrassSignatureType, typedData  } from "starknet";
import { getStarknetTypedDataWithMessage } from "../ryo/ryo.types";
import { EIP712DomainType, EIP712Types } from "../interfaces/eip712.interface";

import { keccak256 } from "viem";
import { recoverMessageAddress, Hex, toHex } from "viem";

/*
 * Sign typed data according to EIP712. For use on Starknet.
 */
export async function signTypedDataStarknet(
    walletClient: Account,
    types: any,
    primaryType: string,
    domain: StarkNetDomain,
    message: any,
): Promise<Signature>   {
    const typedDataToValidate = getStarknetTypedDataWithMessage(types, primaryType, domain, message);
    return  await walletClient.signMessage(
        typedDataToValidate
        ) as WeierstrassSignatureType;
}


/*
 * get messageHash to verify on-chain
 */
export async function getMessageHash(
    walletClient: Account,
    types: any,
    primaryType: string,
    domain: StarkNetDomain,
    message: any,
): Promise<string> {
    let typedDataToValidate = getStarknetTypedDataWithMessage(types, primaryType, domain, message);
    return walletClient.hashMessage(typedDataToValidate);
}

/*
 * Recovers the address of a signed message.
 */
export async function recoverTypedMessageAddress(
    signature: any,
    types: EIP712Types,
    primaryType: string,
    domain: EIP712DomainType,
    message: any,
): Promise<string> {
    const messageHash = hashTypedData(types, primaryType, domain, message);
    const messageHex: Hex = `0x${messageHash}`;
    return recoverMessageAddress({
        message: { raw: messageHex as `0x${string}` },
        signature,
    });
}

/*
 * Hashes typed data.
 */
export function hashTypedData(
    types: EIP712Types,
    primaryType: string,
    domain: EIP712DomainType,
    message: any,
): string {
    // Function to recursively stringify values
    function stringifyValue(value: any): string {
        if (typeof value === "bigint") {
            return value.toString();
        } else if (typeof value === "object" && value !== null) {
            if (Array.isArray(value)) {
                return `[${value.map(stringifyValue).join(",")}]`;
            } else {
                const sortedKeys = Object.keys(value).sort();
                return `{${sortedKeys.map((key) => `"${key}":${stringifyValue(value[key])}`).join(",")}}`;
            }
        } else {
            return JSON.stringify(value);
        }
    }

    // Hash the domain part
    const domainHash = keccak256(
        toHex(
            domain.name +
                "," +
                domain.version +
                "," +
                domain.chainId.toString() +
                "," +
                domain.verifyingContract,
        ),
    ).substring(2);

    // Convert the message to a string, handling nested objects and arrays
    const messageString = stringifyValue(message);
    const messageHash = keccak256(toHex(messageString)).substring(2);

    // Return the final hash
    return keccak256(`0x${domainHash}${messageHash}`).substring(2);
}
