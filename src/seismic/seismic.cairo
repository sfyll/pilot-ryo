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
    use seismic::eip712::get_pool_params_commitment;
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

