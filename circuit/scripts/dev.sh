#! /bin/bash

: '
  Boilerplate circuit compilation & smoke testing. Do not use in prod. Assumes
  naming convention: {$NAME/, $NAME/$NAME.circom, $NAME/${NAME}.func.json,
  and $NAME/${NAME}.smoke.json}. Outputs solidity verifier in 
  ../contracts/src and proving key in $NAME/.
'

NAME=$1
PTAU=$2
UPPER_NAME="$(tr '[:lower:]' '[:upper:]' <<< ${NAME:0:1})${NAME:1}"

# Compile circuit
circom2 ${NAME}/${NAME}.circom --r1cs --wasm

# Generate proving key
npm run snarkjs groth16 setup ${NAME}.r1cs \
                               $PTAU \
                               ${NAME}.zkey

# Generate verifying key
npm run snarkjs zkey export verificationkey ${NAME}.zkey \
                                             ${NAME}.vkey.json

# Compute witness, used as smoke test for circuit
node ${NAME}_js/generate_witness.js \
     ${NAME}_js/${NAME}.wasm \
     ${NAME}/${NAME}.smoke.json \
     ${NAME}.wtns

# Save proving key and witness generation script
mv ${NAME}_js/${NAME}.wasm  ${NAME}.zkey ${NAME}/ 
mv ${NAME}.vkey.json ${NAME}/

# Clean up
rm -r ${NAME}.wtns ${NAME}_js/ ${NAME}.r1cs

