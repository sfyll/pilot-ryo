import { Account, Signature, StarkNetDomain, typedData  } from "starknet";
import { getStarknetTypedDataWithMessage } from "../ryo/ryo.types";

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
    return walletClient.signMessage(
        typedDataToValidate
    );
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
): Promise<String> {
    let typedDataToValidate = getStarknetTypedDataWithMessage(types, primaryType, domain, message);
    return walletClient.hashMessage(typedDataToValidate);
}