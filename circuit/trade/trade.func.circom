pragma circom 2.1.5;

include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

function u128_ceiling() {
    return 340282366920938463463374607431768211455;
}

template InvariantVerification() {
    signal input reserve_in;
    signal input reserve_out;
    signal input amount_in;
    signal input amount_out;

    signal reserve_in_post_trade;
    signal reserve_out_post_trade;
    signal invariant_pre_trade;
    signal invariant_post_trade;

    invariant_pre_trade <== reserve_in * reserve_out;

    reserve_in_post_trade <== reserve_in + amount_in;
    reserve_out_post_trade <== reserve_out - amount_out;
    invariant_post_trade <== reserve_in_post_trade * reserve_out_post_trade;

    invariant_post_trade === invariant_pre_trade;
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
    signal circuit_image_reserve_in;
    signal circuit_image_reserve_out;
    circuit_image_reserve_in <== Poseidon(2)([reserve_in, salt]);
    circuit_image_reserve_in === reserve_in_image;
    circuit_image_reserve_out <== Poseidon(2)([reserve_out, salt]);
    circuit_image_reserve_out === reserve_out_image;

    // =========================================
    // Verify inputs value
    // ========================================= 
    var u128_ceiling = u128_ceiling();
    signal reserve_in_less_than_ceiling;
    signal reserve_out_less_than_ceiling;
    signal amount_out_less_than_reserve_out;

    reserve_in_less_than_ceiling <== LessThan(n)([reserve_in, u128_ceiling]); 
    reserve_out_less_than_ceiling <== LessThan(n)([reserve_out, u128_ceiling]); 
    
    reserve_in_less_than_ceiling === 1;
    reserve_out_less_than_ceiling === 1;

    amount_out_less_than_reserve_out <== LessThan(n)([amount_out, reserve_out]);
    amount_out_less_than_reserve_out === 1;

    // =========================================
    // Verify invariance property
    // ========================================= 
    InvariantVerification()(reserve_in, reserve_out, amount_in, amount_out);
}

