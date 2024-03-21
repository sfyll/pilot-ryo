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

