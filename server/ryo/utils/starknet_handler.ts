import { Account, Contract,  RpcProvider } from 'starknet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let rpcProvider: RpcProvider | undefined;
let contractAccount: Contract | undefined; 

/*
* Create RpcProvider if an instance doesn't yet exist.
*/
export function getRpcProvider(): RpcProvider {
  if (!rpcProvider) {
    rpcProvider = new RpcProvider({
      nodeUrl: process.env.RPC_URL,
    });
  }
  return rpcProvider;
}
/*
* Create a compiledAccountContract (mostly for signature verification) if an instance doesn't yet exist.
*/
export function getContractAccount(address: string): Contract {
  if (!rpcProvider) {
    rpcProvider = getRpcProvider();
  }
  if (!contractAccount) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const contractPath = path.join(__dirname, '../../contract/myAccountAbstraction.json');
    const compiledAccountContract = JSON.parse(fs.readFileSync(contractPath, 'ascii'));
    contractAccount = new Contract(compiledAccountContract.abi, address, rpcProvider);
  }
  return contractAccount as Contract;
}

/*
 * Instantiate Wallet Provider pointing to katana client. 
 */
export async function setupDojoProviderSeismic():  Promise<Account>  {

    const rpcProvider = new RpcProvider({
        nodeUrl: process.env.RPC_URL,
    });
    
    return new Account(rpcProvider, process.env.SEQUENCER_ADDR as string, process.env.SEQUENCER_PRIVKEY as string, "1");
}
