#!/bin/bash

# if you haven't generated an account, uncomment the below two files.
# The first input can be any private key as given per katana client, whereas the second input will be the affiliated Account address.
#starkli signer keystore from-key account0_keystore.json
#starkli account fetch 0x6b86e40118f29ebe393a75469b4d926c7a44c2e2681b6d319520b7c1156d114 --rpc http://0.0.0.0:5050 --output account0_account.json

class_hash=$(starkli declare ../target/dev/seismic_Seismic.contract_class.json --rpc http://0.0.0.0:5050 --account account0_account.json --keystore account0_keystore.json --compiler-version 2.5.4 --max-fee 0.01)

contract_address=$(starkli deploy "$class_hash" 0x788d5c7eacd34e7778fec1eaadb30c285107d104dabcc63b8ed7d80bbdfa1b1 0x6fb6f2999636e8adbc0f70692dbb6d60175a9ca0ad57ba2204daa1aaec6840c  --rpc http://0.0.0.0:5050 --account account0_account.json --keystore account0_keystore.json --max-fee 0.01)

if [ -n "$contract_address" ]; then
    # Navigate up one directory and then into the /server/ directory
    cd ../server/

    if [ -f ".env" ]; then
        # Use sed to replace the VERIFIER_CONTRACT_ADDRESS value in the .env file
        sed -i '' "s/VERIFIER_CONTRACT_ADDRESS=.*/VERIFIER_CONTRACT_ADDRESS=$contract_address/" .env

        echo "Updated VERIFIER_CONTRACT_ADDRESS in .env file to $contract_address"
    else
        echo ".env file does not exist in the /server/ directory."
    fi
else
    echo "Failed to extract contract address from the deploy output."
fi

