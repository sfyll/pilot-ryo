pragma circom 2.1.5;

include "../../trade/trade.func.circom";

component main { public [ reserve_in_image, reserve_out_image ] } = Trade(251);
