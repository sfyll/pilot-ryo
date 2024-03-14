pragma circom 2.1.5;

include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

function u128_ceiling() {
    return 340282366920938463463374607431768211455;
}

template Trade(n) {
    // =========================================
    // Private Inputs
    // =========================================
    signal input amount_in;
    signal input reserve_in;
    signal input reserve_out;
    signal input amount_out;
    signal input salt;

    // =========================================
    // Public Inputs
    // =========================================
    signal input reserve_in_image;
    signal input reserve_out_image;

    // =========================================
    // Verify preimage knowledge
    // =========================================
    component hasher_reserve_in = Poseidon(2);
    component hasher_reserve_out = Poseidon(2);

    hasher_reserve_in.inputs[0] <== reserve_in;
    hasher_reserve_in.inputs[1] <== salt;
    hasher_reserve_out.inputs[0] <== reserve_out;
    hasher_reserve_out.inputs[1] <== salt;

    hasher_reserve_in.out === reserve_in_image;
    hasher_reserve_out.out === reserve_out_image;

    // =========================================
    // Verify inputs value
    // ========================================= 
    component isLessThan_reserve_in = LessThan(n);
    component isLessThan_reserve_out = LessThan(n);
    var u128_ceiling = u128_ceiling();

    isLessThan_reserve_in.in[0] <== reserve_in;
    isLessThan_reserve_in.in[1] <== u128_ceiling;

    isLessThan_reserve_out.in[0] <== reserve_out;
    isLessThan_reserve_out.in[1] <== u128_ceiling;

    isLessThan_reserve_in.out === 1; 
    isLessThan_reserve_out.out === 1;

    component amount_out_less_than_reserve_out = LessThan(n);
    amount_out_less_than_reserve_out.in[0] <== amount_out;
    amount_out_less_than_reserve_out.in[1] <== reserve_out;

    amount_out_less_than_reserve_out.out === 1;

    // =========================================
    // Verify invariance property
    // ========================================= 
    signal numerator;
    signal denumerator;
    signal invariant_pre_trade;

    invariant_pre_trade <== reserve_in * reserve_out;
    
    signal reserve_in_post_trade;
    signal reserve_out_post_trade;
    signal invariant_post_trade;

    reserve_in_post_trade <== reserve_in + amount_in;
    reserve_out_post_trade <== reserve_out - amount_out;
    invariant_post_trade <== reserve_in_post_trade * reserve_out_post_trade;

    invariant_post_trade === invariant_pre_trade;
}

