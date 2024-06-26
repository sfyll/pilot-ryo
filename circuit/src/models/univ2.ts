/*
 * Univ2 class assuming no swap fees 
 */
export default class Univ2 {
  reserve_in: bigint;
  reserve_out: bigint;

  constructor(reserve_in: bigint, reserve_out: bigint) {
    this.reserve_in = reserve_in;
    this.reserve_out = reserve_out;
  }

/*
 * GetAmountOut following Univ2 specs.
 * NB: We round up as handled on starknet.
 */
  public getAmountOut(amountIn: bigint): bigint {
    const numerator = amountIn * this.reserve_out;
    const denominator = this.reserve_in + amountIn;
    return (numerator + denominator - BigInt(1)) / denominator;
  }


/*
 * GetAmountIn following Univ2 specs.
 * NB: We round up as handled on starknet.
 */
  public getAmountIn(amountOut: bigint): bigint {
    if (amountOut >= this.reserve_out) {
      throw new Error('Insufficient liquidity');
    }
    const numerator = this.reserve_in * amountOut;
    const denominator = (this.reserve_out - amountOut);
    return (numerator + denominator - BigInt(1)) / denominator;
  }
}


