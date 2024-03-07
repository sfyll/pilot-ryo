import { Silicon } from './silicon'; 
import { poseidonHashMany } from "@scure/starknet";
import { EncryptedMarketSilicon, TransparentMarketSilicon } from './types';

/*
 * Check that we have a bijection between both maps. 
 */
export function verifySiliconMapping(encrypted_silicon: Silicon<EncryptedMarketSilicon>, transparent_silicon: Silicon<TransparentMarketSilicon>): boolean {
    if (encrypted_silicon.markets.size !== transparent_silicon.markets.size) return false;

    for (const [key, encrypted_market] of encrypted_silicon.markets.entries()) {
        const transparent_market = transparent_silicon.markets.get(key);

        if (!transparent_market) return false;

        const hashCash = poseidonHashMany([BigInt(transparent_market.cash)]);
        const hashQuantity = poseidonHashMany([BigInt(transparent_market.quantity)]);

        if (BigInt(encrypted_market.cash) !== hashCash || BigInt(encrypted_market.quantity) !== hashQuantity) return false;
  }
  return true;
}
