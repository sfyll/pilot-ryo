pragma circom 2.1.5;

include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

function u128_ceiling() {
    return 340282366920938463463374607431768211455;
}

template ComputeInvariant() {
    signal input reserve_in;
    signal input reserve_out;
    signal input amount_in;
    signal input amount_out;

    signal output invariant_post_trade;

    signal reserve_in_post_trade;
    signal reserve_out_post_trade;
    reserve_in_post_trade <== reserve_in + amount_in;
    reserve_out_post_trade <== reserve_out - amount_out;
    invariant_post_trade <== reserve_in_post_trade * reserve_out_post_trade;
}

template InvariantVerification(n) {
    signal input reserve_in;
    signal input reserve_out;
    signal input amount_in;
    signal input amount_in_rounded_down;
    signal input amount_out;
    signal input amount_out_rounded_down;

    signal invariant_pre_trade <== reserve_in * reserve_out;

    // =========================================
    // We're asserting that if amountIn was computed we have a relationship of the form: k with roundedAmounIn <= k <= k with amountIn;
    // else, if amountOut was computed, the relationship is of the form: k with amountOut <= k <= k with roundedAmountOut;
    // To understand why, remember that starknet rounds up. Hence, when we round down the amountIn, we put less into the pool.
    // Conversely, when we round down the amountOut, we remove less from the pool.
    // =========================================
    signal invariant_post_trade_amount_in_ceiling_to_be_toggled <== ComputeInvariant()(reserve_in, reserve_out, amount_in, amount_out);
    signal invariant_post_trade_amount_out_ceiling_to_be_toggled <== ComputeInvariant()(reserve_in, reserve_out, amount_in_rounded_down, amount_out_rounded_down);
    signal invariant_post_trade_amount_in_ceiling <== invariant_post_trade_amount_in_ceiling_to_be_toggled * (amount_in - amount_in_rounded_down);
    signal invariant_post_trade_amount_out_ceiling <== invariant_post_trade_amount_out_ceiling_to_be_toggled * (amount_out - amount_out_rounded_down);
    signal invariant_post_trade_ceiling <== invariant_post_trade_amount_in_ceiling + invariant_post_trade_amount_out_ceiling;

    signal invariant_post_trade_amount_in_floor_to_be_toggled <== ComputeInvariant()(reserve_in, reserve_out, amount_in_rounded_down, amount_out_rounded_down);
    signal invariant_post_trade_amount_out_floor_to_be_toggled <== ComputeInvariant()(reserve_in, reserve_out, amount_in, amount_out);
    signal invariant_post_trade_amount_in_floor <== invariant_post_trade_amount_in_floor_to_be_toggled * (amount_in - amount_in_rounded_down);
    signal invariant_post_trade_amount_out_floor <== invariant_post_trade_amount_out_floor_to_be_toggled * (amount_out - amount_out_rounded_down);
    signal invariant_post_trade_floor <== invariant_post_trade_amount_in_floor + invariant_post_trade_amount_out_floor;
    

    signal invariant_pre_trade_lower_than_invariant_post_trade <== LessEqThan(n)([invariant_pre_trade, invariant_post_trade_ceiling]);
    signal invariant_rounded_down_lower_than_invariant_pre_trade <== LessEqThan(n)([invariant_post_trade_floor, invariant_pre_trade]);

    1 === invariant_pre_trade_lower_than_invariant_post_trade;
    1 === invariant_rounded_down_lower_than_invariant_pre_trade;
}

template Trade(n) {
    // =========================================
    // Private Inputs | Only amount actually rounded down is the computed one.
    // =========================================
    signal input amount_in;
    signal input amount_in_rounded_down;
    signal input reserve_in;
    signal input reserve_out;
    signal input amount_out;
    signal input amount_out_rounded_down;
    signal input salt;

    // =========================================
    // Public Inputs
    // =========================================
    signal input reserve_in_image;
    signal input reserve_out_image;

    // =========================================
    // Verify rounded down values
    // =========================================
    signal amount_in_minus_amount_in_rounded_down_is_less_than_one;
    signal amount_out_minus_amount_out_rounded_down_is_less_than_one;

    amount_in_minus_amount_in_rounded_down_is_less_than_one <== LessThan(n)([amount_in_rounded_down - amount_in, 1]);
    amount_out_minus_amount_out_rounded_down_is_less_than_one <== LessThan(n)([amount_out_rounded_down - amount_out, 1]);

    amount_in_minus_amount_in_rounded_down_is_less_than_one === 1;
    amount_out_minus_amount_out_rounded_down_is_less_than_one === 1;

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
    InvariantVerification(n)(reserve_in, reserve_out, amount_in, amount_in_rounded_down, amount_out, amount_out_rounded_down);
}
