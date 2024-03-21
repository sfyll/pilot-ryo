//SOURCE: https://github.com/argentlabs/starknet-off-chain-signature/blob/main/src/simple_struct.cairo
use core::traits::TryInto;
use core::box::BoxTrait;
use starknet::{
    contract_address_const, get_tx_info, get_caller_address, testing::set_caller_address
};
use core::pedersen::PedersenTrait;
use core::hash::{HashStateTrait, HashStateExTrait};
use starknet::ContractAddress;

const STARKNET_DOMAIN_TYPE_HASH: felt252 =
    selector!("StarkNetDomain(name:felt,version:felt,chainId:felt)");

const SIMPLE_STRUCT_TYPE_HASH: felt252 =
    selector!("TradeDA(cash:felt,quantity:felt)");

#[derive(Drop, Copy, Hash)]
struct PoolParams {
    cash: felt252,
    quantity: felt252,
}

#[derive(Drop, Copy, Hash)]
struct StarknetDomain {
    name: felt252,
    version: felt252,
    chain_id: felt252,
}

trait IStructHash<T> {
    fn hash_struct(self: @T) -> felt252;
}

trait IOffchainMessageHash<T> {
    fn get_message_hash(self: @T, seismic_address: ContractAddress) -> felt252;
}

impl OffchainMessageHashSimpleStruct of IOffchainMessageHash<PoolParams> {
    fn get_message_hash(self: @PoolParams, seismic_address: ContractAddress) -> felt252 {
        let domain = StarknetDomain {
            name: 'SeismicRyo', version: 1, chain_id: 0x4b4154414e41
        };
        let mut state = PedersenTrait::new(0);
        state = state.update_with('StarkNet Message');
        state = state.update_with(domain.hash_struct());
        state = state.update_with(seismic_address);
        state = state.update_with(self.hash_struct());
        state = state.update_with(4);
        state.finalize()
    }
}

impl StructHashStarknetDomain of IStructHash<StarknetDomain> {
    fn hash_struct(self: @StarknetDomain) -> felt252 {
        let mut state = PedersenTrait::new(0);
        state = state.update_with(STARKNET_DOMAIN_TYPE_HASH);
        state = state.update_with(*self);
        state = state.update_with(4);
        state.finalize()
    }
}

impl StructHashSimpleStruct of IStructHash<PoolParams> {
    fn hash_struct(self: @PoolParams) -> felt252 {
        let mut state = PedersenTrait::new(0);
        state = state.update_with(SIMPLE_STRUCT_TYPE_HASH);
        state = state.update_with(*self);
        state = state.update_with(3);
        state.finalize()
    }
}

pub fn get_pool_params_commitment(cash: felt252, quantity: felt252, seismic_address: ContractAddress) -> felt252 {
    let pool_params = PoolParams {cash: cash, quantity: quantity};
    return pool_params.get_message_hash(seismic_address);
}

// Below is commented because it can be tested with scarb test but will break snforge tests
// use starknet::ContractAddress;
// #[test]
// fn test_valid_hash() {
//    let message_hash = 0x506fb191723528414503395615b1bf141258558c8b1f6f67443255ddf330714;
//    let simple_struct = PoolParams { cash: 0x32bc7b08be58b5b122343f69006cf51d04d735331d97c63f43fb696ea7baec9, quantity: 0x6e65f09527633e587f0f1ffb8c6d288e10ea5a70032b05748fd9d69fa483b93 };
//    let address_felt: felt252 = 0x6fb6f2999636e8adbc0f70692dbb6d60175a9ca0ad57ba2204daa1aaec6840c;
//    let callerAddress: ContractAddress = address_felt.try_into().unwrap();
//    set_caller_address(callerAddress);
//    assert(simple_struct.get_message_hash(callerAddress) == message_hash, 'Hash should be valid');
// }
