import { TradeSide } from "../types/TradeSide";
import { ZkpParams } from "../types/ZkpParams";
import { genRandomInt, getPoseidonHash } from "../utils/crypto";
import Univ2 from "./Univ2";

export default class Trade {
    pool: Univ2;
    salt: bigint;
    amountIn: bigint;
    amountOut: bigint;
    reserve_in_image: string;
    reserve_out_image: string;
    zkpParams: ZkpParams;

    constructor(pool: Univ2, salt: bigint, amountIn: bigint, amountOut: bigint, reserve_in_image: string, reserve_out_image: string, zkpParams: ZkpParams) {
        this.pool = pool;
        this.salt = salt;
        this.amountIn = amountIn;
        this.amountOut = amountOut;
        this.reserve_in_image = reserve_in_image;
        this.reserve_out_image = reserve_out_image;
        this.zkpParams = zkpParams;
    }

    /*
     * Generalized function to create a Trade instance
     */
    private static async createTrade(reserve_in: bigint, reserve_out: bigint, amountIn: bigint, amountOut: bigint) {
        const pool = new Univ2(reserve_in, reserve_out);
        const salt = genRandomInt();
        const reserve_in_image = await Trade.get_reserve_image(pool.reserve_in, salt);
        const reserve_out_image = await Trade.get_reserve_image(pool.reserve_out, salt);
        const zkpParams = Trade.getZkpParams(amountIn, pool.reserve_in, pool.reserve_out, amountOut, salt, reserve_in_image, reserve_out_image);
        return new Trade(pool, salt, amountIn, amountOut, reserve_in_image, reserve_out_image, zkpParams);
    }

    /*
     * Get circuit parameters for buys
    */
    private static async getParametersBuy(reserve_in: bigint, reserve_out: bigint, amountOut: bigint) {
        const pool = new Univ2(reserve_in, reserve_out);
        const amountIn = pool.getAmountIn(amountOut);
        return Trade.createTrade(reserve_in, reserve_out, amountIn, amountOut);   
    }

    /*
     * Get circuit parameters for sells 
    */
    private static async getParametersSell(reserve_in: bigint, reserve_out: bigint, amountIn: bigint) {
        const pool = new Univ2(reserve_in, reserve_out);
        const amountOut = pool.getAmountOut(amountIn);
        return Trade.createTrade(reserve_in, reserve_out, amountIn, amountOut);
    }
     
    /*
     * Get zkpParams for either buy or sell 
    */
    public static getZkpParams(amountIn: bigint, reserve_in: bigint, reserve_out: bigint, amountOut: bigint, salt: bigint, reserve_in_image: string, reserve_out_image: string): ZkpParams {
        return {
            amount_in: amountIn.toString(),
            reserve_in: reserve_in.toString(),
            reserve_out: reserve_out.toString(),
            amount_out: amountOut.toString(),
            salt: salt.toString(),
            reserve_in_image: reserve_in_image,
            reserve_out_image: reserve_out_image
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
