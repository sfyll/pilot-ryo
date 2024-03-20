 // @ts-ignore
import {buildPoseidon} from "circomlibjs";
// @ts-ignore
import { genRandomSalt } from "maci-crypto";


/*
* Get Poseidon Hash as computed and typed by Circom;
* In our case, the array will have two elements, the input and a salt.
*/
export async function getPoseidonHash(inputs: bigint[]): Promise<string> {
    const poseidon = await buildPoseidon();  
    let hashBytes = poseidon(inputs);
    return poseidon.F.toString(hashBytes);
}

/*
 * Wrapper for genRandomSalt();
 */
export function genRandomInt(): bigint {
    return genRandomSalt() as bigint;
}

