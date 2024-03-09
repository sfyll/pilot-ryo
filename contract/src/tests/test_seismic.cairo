use snforge_std::{ declare, ContractClassTrait, ContractClass };
use seismic::seismic::{ISeismic, Seismic, ISeismicDispatcher};
use starknet::secp256_trait::Signature;

// fn deploy() -> ContractAddress {
//     let contract = declare('Seismic');

//     let public_key : felt252 =  0x30A333e4207129AD466a0B88b329651833605de4;

//     let mut calldata = array![];

//     calldata.append(public_key);

//     let contract_address = contract.deploy(@calldata).unwrap();

//     let dispatcher = ISeismicDispatcher{contract_address};
// }


#[test]
fn test_verify_signature() {
    let contract = declare('Seismic');

    let public_key : felt252 =  0x30A333e4207129AD466a0B88b329651833605de4;

    let mut calldata = array![];

    calldata.append(public_key);

    let contract_address = contract.deploy(@calldata).unwrap();

    let dispatcher = ISeismicDispatcher { contract_address };

    let commitment: u256 = 0xb453bd4e271eed985cbab8231da609c4ce0a9cf1f763b6c1594e76315510e0f1;
    let signature = Signature {
        r: 0x878d82eea96143eebc3a5669585d592f2cd40011972a1f7a9c5a3e50b9dfde53,
        s: 0x32e5d84eeb0d14588aab7659e15ba267dafb312d63b07cfac18cb48ff179e1fb, 
        y_parity: false
    };
    //dispatcher.verify_signature(commitment, signature);
}

#[test]
#[should_panic]
fn test_fail_verify_signature() {
    let contract = declare('Seismic');

    let public_key : felt252 =  0x30A333e4207129AD466a0B88b329651833605de4;

    let mut calldata = array![];

    calldata.append(public_key);

    let contract_address = contract.deploy(@calldata).unwrap();

    let dispatcher = ISeismicDispatcher { contract_address };

    let commitment: u256 = 0xb453bd4e271eed985cbab8231da609c4ce0a9cf1f763b6c1594e76315510e0f2;
    let signature = Signature {
        r: 0x878d82eea96143eebc3a5669585d592f2cd40011972a1f7a9c5a3e50b9dfde53,
        s: 0x32e5d84eeb0d14588aab7659e15ba267dafb312d63b07cfac18cb48ff179e1fb, 
        y_parity: false
    };
    //dispatcher.verify_signature(commitment, signature);
}