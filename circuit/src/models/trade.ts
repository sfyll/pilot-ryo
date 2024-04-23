import { TradeSide } from "../types/TradeSide";
import { ZkpParams } from "../types/ZkpParams";
import { genRandomInt, getPoseidonHash } from "../utils/crypto";
import Univ2 from "./Univ2";

export default class Trade {
    pool: Univ2;
    salt: bigint;
    amountIn: bigint;
    amountInRoundedDown: bigint;
    amountOut: bigint;
    amountOutRoundedDown: bigint;
    reserve_in_image: string;
    reserve_out_image: string;

    constructor(pool: Univ2, salt: bigint, amountIn: bigint, amountInRoundedDown: bigint, amountOut: bigint, amountOutRoundedDown: bigint, reserve_in_image: string, reserve_out_image: string) {
        this.pool = pool;
        this.salt = salt;
        this.amountIn = amountIn;
        this.amountInRoundedDown = amountInRoundedDown;
        this.amountOut = amountOut;
        this.amountOutRoundedDown = amountOutRoundedDown;
        this.reserve_in_image = reserve_in_image;
        this.reserve_out_image = reserve_out_image;
    }

    /*
     * Generalized function to create a Trade instance
     */
    private static async createTrade(reserve_in: bigint, reserve_out: bigint, amountIn: bigint, amountInRoundedDown: bigint, amountOut: bigint, amountOutRoundedDown: bigint) {
        const pool = new Univ2(reserve_in, reserve_out);
        const salt = genRandomInt();
        const reserve_in_image = await Trade.get_reserve_image(pool.reserve_in, salt);
        const reserve_out_image = await Trade.get_reserve_image(pool.reserve_out, salt);
        return new Trade(pool, salt, amountIn, amountInRoundedDown, amountOut, amountOutRoundedDown, reserve_in_image, reserve_out_image);
    }

    /*
     * Get circuit parameters for buys
    */
    private static async getParametersBuy(reserve_in: bigint, reserve_out: bigint, amountOut: bigint) {
        const pool = new Univ2(reserve_in, reserve_out);
        const amountIn = pool.getAmountIn(amountOut);
        const amountInRoundedDown = amountIn - BigInt(1);
        return Trade.createTrade(reserve_in, reserve_out, amountIn,  amountInRoundedDown, amountOut, amountOut);   
    }

    /*
     * Get circuit parameters for sells 
    */
    private static async getParametersSell(reserve_in: bigint, reserve_out: bigint, amountIn: bigint) {
        const pool = new Univ2(reserve_in, reserve_out);
        const amountOut = pool.getAmountOut(amountIn);
        const amountOutRoundedDown = amountOut - BigInt(1)
        return Trade.createTrade(reserve_in, reserve_out, amountIn, amountIn, amountOut, amountOutRoundedDown);
    }
     
    /*
     * Get zkpParams for either buy or sell 
    */
    public getZkpParams(): ZkpParams {
        return {
            amount_in: this.amountIn.toString(),
            amount_in_rounded_down: this.amountInRoundedDown.toString(),
            reserve_in: this.pool.reserve_in.toString(),
            reserve_out: this.pool.reserve_out.toString(),
            amount_out: this.amountOut.toString(),
            amount_out_rounded_down: this.amountOutRoundedDown.toString(),
            salt: this.salt.toString(),
            reserve_in_image: this.reserve_in_image,
            reserve_out_image: this.reserve_out_image
        }
    }

    /*
     * get an instance of Trade class depending on trade direction.
     * We spawn an instance per trade given that they have a one-to-one mapping to corresponding zkp
    */
    public static async getTrade(reserve_in: bigint, reserve_out: bigint, amount: bigint, side: TradeSide = TradeSide.BUY): Promise<Trade> {
        if (side === TradeSide.BUY) {
            return Trade.getParametersBuy(reserve_in, reserve_out, amount)
        } else if (side === TradeSide.SELL) {
            return Trade.getParametersSell(reserve_in, reserve_out, amount)
        }
    }
    
    /*
     * Get poseidonHash for a an array of size 2: the reserve and a salt
    */
    public static async get_reserve_image(reserve: bigint, salt: bigint) {
      return getPoseidonHash([reserve, salt])
    }
}
