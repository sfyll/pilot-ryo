import { PrivateKeyAccount, recoverMessageAddress, Hex, toHex } from "viem";
import { getMessage } from "eip-712";
import { EIP712DomainType, EIP712Types } from "../interfaces/eip712.interface";
import { keccak256 } from "viem";
import { MessagePrefix } from "ethers";
import { kcc } from "viem/chains";
import { Account, Signature, SignerInterface, StarkNetDomain, TypedData, WeierstrassSignatureType, typedData } from "starknet";
import { getStarknetTypedDataWithMessage } from "../ryo/ryo.types";

/*
 * Converts a uint8 array to a hexstring w/o the leading '0x'.
 */
function uint8ArrayToHexString(byteArray: Uint8Array): string {
    return Array.from(byteArray, function (byte) {
        return ("0" + (byte & 0xff).toString(16)).slice(-2);
    }).join("");
}

/*
 * Sign typed data according to EIP712.
 */
export async function signTypedData(
    walletClient: any,
    account: PrivateKeyAccount,
    types: any,
    primaryType: string,
    domain: EIP712DomainType,
    message: any,
): Promise<string> {
    const messageHash = hashTypedData(types, primaryType, domain, message);
    const messageHex: Hex = `0x${messageHash}`;
    return walletClient.signMessage({
        account,
        message: { raw: messageHex as `0x${string}` },
    });
}

/*
 * Sign typed data according to EIP712. For use on Starknet.
 */
export async function signTypedDataStarknet(
    walletClient: Account,
    types: any,
    primaryType: string,
    domain: StarkNetDomain,
    message: any,
): Promise<Signature> {
    let typedDataToValidate = getStarknetTypedDataWithMessage(types, primaryType, domain, message);
    console.log("typedData: ", typedDataToValidate)
    let msgHash = typedData.getMessageHash(typedDataToValidate, walletClient.address)  
    console.log("hash:  ", msgHash)
    return walletClient.signMessage(
        typedDataToValidate
    );
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
