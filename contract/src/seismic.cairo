use starknet::secp256_trait::Signature;

#[starknet::interface]
trait ISeismic<TContractState> {
    fn verify_signature(self: @TContractState, commitment: felt252, cash: felt252, quantity: felt252, signature: Signature);
}

#[starknet::contract]
mod Seismic {
    use core::option::OptionTrait;
    use core::traits::TryInto;
    use starknet::secp256_trait::Signature; 
    use seismic::eip712_simple_struct::get_pool_params_commitment;
    use starknet::ContractAddress;
    use core::ecdsa::check_ecdsa_signature;
    use core::assert;

    #[storage]
    struct Storage {
        seismic_public_key: felt252,
        seismic_contract_address: ContractAddress,
    }
    
    //
    // commenting the body until we can deploy the contract
    //
    #[constructor]
    fn constructor(ref self: ContractState, public_key: felt252, address_seismic_starknet: felt252) {
        self.seismic_public_key.write(public_key);
        self.seismic_contract_address.write(address_seismic_starknet.try_into().unwrap());
    }

    //
    // Public view function that verify Seismic Signature. 
    //
    #[abi(embed_v0)]
    impl Seismic of super::ISeismic<ContractState> {        
        fn verify_signature(self: @ContractState, commitment: felt252, cash: felt252, quantity: felt252, signature: Signature) {
            assert(get_pool_params_commitment(cash, quantity, self.seismic_contract_address.read()) == commitment, 200);
            assert(check_ecdsa_signature(commitment, self.seismic_public_key.read(), signature.r.try_into().unwrap(), signature.s.try_into().unwrap()) == true, 201);
        }
        }
    }

#[cfg(test)]
mod tests {
    use seismic::seismic::ISeismicDispatcherTrait;
    use snforge_std::{ declare, ContractClassTrait };
    use seismic::seismic::{ISeismic, Seismic, ISeismicDispatcher};
    use starknet::secp256_trait::{Signature, signature_from_vrs};
    use starknet::{ContractAddress};

    #[test]
    fn test_verify_signature() {
        let contract = declare("Seismic");

        let public_key : felt252 =  0x788d5c7eacd34e7778fec1eaadb30c285107d104dabcc63b8ed7d80bbdfa1b1;
        let address_seismic_starknet: felt252 = 0x6fb6f2999636e8adbc0f70692dbb6d60175a9ca0ad57ba2204daa1aaec6840c;

        let mut calldata = array![];

        calldata.append(public_key);
        calldata.append(address_seismic_starknet);

        let contract_address = contract.deploy(@calldata).unwrap();

        let dispatcher = ISeismicDispatcher { contract_address };

        let commitment: felt252 = 0x506fb191723528414503395615b1bf141258558c8b1f6f67443255ddf330714;
        let signature = Signature {
            r: 300136576235067440134385895102963648255578671661113346025998212864770581420,
            s: 2307398616513861481499065117492895322340166067393557713734117244912719712318, 
            y_parity: false
        };
        let cash = 0x32bc7b08be58b5b122343f69006cf51d04d735331d97c63f43fb696ea7baec9;
        let quantity = 0x6e65f09527633e587f0f1ffb8c6d288e10ea5a70032b05748fd9d69fa483b93;
        dispatcher.verify_signature(commitment, cash, quantity, signature);
    }

    #[test]
    #[should_panic]
    fn test_fail_verify_signature() {
        let contract = declare("Seismic");

        let public_key : felt252 =  0x788d5c7eacd34e7778fec1eaadb30c285107d104dabcc63b8ed7d80bbdfa1b2;
        let address_seismic_starknet: felt252 = 0x6fb6f2999636e8adbc0f70692dbb6d60175a9ca0ad57ba2204daa1aaec6840c;

        let mut calldata = array![];

        calldata.append(public_key);
        calldata.append(address_seismic_starknet);


        let contract_address = contract.deploy(@calldata).unwrap();

        let dispatcher = ISeismicDispatcher { contract_address };

        let commitment: felt252 = 0x506fb191723528414503395615b1bf141258558c8b1f6f67443255ddf330714;
        let signature = Signature {
            r: 300136576235067440134385895102963648255578671661113346025998212864770581422,
            s: 2307398616513861481499065117492895322340166067393557713734117244912719712318, 
            y_parity: false
        };
        let cash = 0x32bc7b08be58b5b122343f69006cf51d04d735331d97c63f43fb696ea7baec9;
        let quantity = 0x6e65f09527633e587f0f1ffb8c6d288e10ea5a70032b05748fd9d69fa483b93;
        dispatcher.verify_signature(commitment, cash, quantity, signature);

    }
}

