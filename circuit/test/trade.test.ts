const { wasm } = require("circom_tester");
const chai = require('chai')
import Trade from "../src/models/Trade";
import Univ2 from "../src/models/Univ2";
import { TradeSide } from "../src/types/TradeSide";
import { genRandomInt } from "../src/utils/crypto";
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised)

describe("Unit test for getAmountIn()", () => {
    let circuit;
    let reserve_in = BigInt(10_000);
    let reserve_out = BigInt(100_000);
    let pool = new Univ2(reserve_in, reserve_out)
    beforeEach(async () => {
        circuit = await wasm("test/circuits/test_check_trade.circom");
    });
    
    it("succeed as the invariant holds", async () => {
        const amountOut = BigInt(50_000); 
        const trade: Trade = await Trade.getTrade(reserve_in, reserve_out, amountOut, TradeSide.BUY)
        const w = await circuit.calculateWitness(trade.zkpParams);
        await circuit.checkConstraints(w);
    });

    it("fails as the invariant doesn't hold", async () => {
        const salt = genRandomInt();
        const reserve_in_image = await Trade.get_reserve_image(pool.reserve_in, salt) 
        const reserve_out_image = await Trade.get_reserve_image(pool.reserve_out, salt) 
        const amountOut = BigInt(50_000); 
        const amountIn = pool.getAmountIn(amountOut);         

        let w = circuit.calculateWitness({
            amount_in: amountIn.toString(),
            reserve_in: pool.reserve_in.toString(),
            reserve_out: pool.reserve_out.toString(),
            amount_out: amountIn.toString(),
            salt: salt.toString(),
            reserve_in_image: reserve_in_image.toString(),
            reserve_out_image: reserve_out_image.toString(),
        });
        await expect(w).to.be.rejected
    });
    it("fails as the preimage is wrong", async () => {
        const salt = genRandomInt();
        const reserve_out_image = await Trade.get_reserve_image(pool.reserve_out, salt) 
        const amountOut = BigInt(50_000); 
        const amountIn = pool.getAmountIn(amountOut);         

        const w =  circuit.calculateWitness({
            amount_in: amountIn.toString(),
            reserve_in: pool.reserve_in.toString(),
            reserve_out: pool.reserve_out.toString(),
            amount_out: amountIn.toString(),
            salt: salt.toString(),
            reserve_in_image: BigInt(0).toString(),
            reserve_out_image: reserve_out_image.toString(),
        });
        await expect(w).to.be.rejected
    });
})

describe("Unit test for GetAmountOut()", () => {
    let circuit;
    let reserve_in = BigInt(10_000);
    let reserve_out = BigInt(100_000);
    let pool = new Univ2(reserve_in, reserve_out)
    beforeEach(async () => {
        circuit = await wasm("test/circuits/test_check_trade.circom");
    });
    
    it("succeed as the invariant holds", async () => {
        const amountIn = BigInt(5_000); 
        const trade: Trade = await Trade.getTrade(reserve_in, reserve_out, amountIn, TradeSide.SELL)
        const w = await circuit.calculateWitness(trade.zkpParams);
        await circuit.checkConstraints(w);
    });

    it("fails as the invariant doesn't hold", async () => {
        const salt = genRandomInt();
        const reserve_in_image = await Trade.get_reserve_image(pool.reserve_in, salt) 
        const reserve_out_image = await Trade.get_reserve_image(pool.reserve_out, salt) 
        const amountIn = BigInt(5_000); 

        let w = circuit.calculateWitness({
            amount_in: amountIn.toString(),
            reserve_in: pool.reserve_in.toString(),
            reserve_out: pool.reserve_out.toString(),
            amount_out: amountIn.toString(),
            salt: salt.toString(),
            reserve_in_image: reserve_in_image.toString(),
            reserve_out_image: reserve_out_image.toString(),
        });
        await expect(w).to.be.rejected
    });
    it("fails as the preimage is wrong", async () => {
        const salt = genRandomInt();
        const reserve_out_image = await Trade.get_reserve_image(pool.reserve_out, salt) 
        const amountIn = BigInt(5_000); 
        const amountOut = pool.getAmountIn(amountIn);         
              

        const w =  circuit.calculateWitness({
            amount_in: amountIn.toString(),
            reserve_in: pool.reserve_in.toString(),
            reserve_out: pool.reserve_out.toString(),
            amount_out: amountOut.toString(),
            salt: salt.toString(),
            reserve_in_image: BigInt(0).toString(),
            reserve_out_image: reserve_out_image.toString(),
        });
        await expect(w).to.be.rejected
    });
})

