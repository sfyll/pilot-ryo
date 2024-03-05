import { ethers } from 'ethers';

// Provided private key
const privateKey = '0x89ac8b3450f4f77fba1214fde42da15bc0d6b74cd1e77d8831528143ed8dc52c';
// --- other data affiliated with the above private key ----- 
// address: 0x30A333e4207129AD466a0B88b329651833605de4
// public key == 0x02d8834cfd7957d3cdf4ddd4ff038e6f8c06f31170d486cb52b737c0d41b0273e0

// Create a wallet instance using the provided private key
const wallet = new ethers.Wallet(privateKey);

// The message to sign
const message = 'Hello, world!';

// Hash the message (Ethereum's message hashing standard)
const messageHash = ethers.hashMessage(message);

const signature_data = wallet.signingKey.sign(messageHash);

console.log("signature data: ", signature_data);

wallet.signMessage((message)).then(signature => {
    console.log('Signature:', signature);

    const recoveredAddress = ethers.recoverAddress(messageHash, signature);

    const isValid = recoveredAddress.toLowerCase() === wallet.address.toLowerCase();
    console.log('Is the signature valid?', isValid);
}).catch(error => {
    console.error('Error signing the message:', error);
});


