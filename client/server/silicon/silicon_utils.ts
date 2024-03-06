import { EncryptedMarket, Market } from '../../graphql/graphql';
import { Silicon } from './silicon'; // Assume this is the path to your Silicon class
import { poseidonHashMany } from "@scure/starknet";

export function verifySiliconMapping(encrypted_silicon: Silicon<EncryptedMarket>, transparent_silicon: Silicon<Market>): boolean {
    if (encrypted_silicon.markets.length !== transparent_silicon.markets.length) return false;

    for (let i = 0; i < encrypted_silicon.markets.length; i++) {
        const encrypted_market = encrypted_silicon.markets[i];
        const transparent_market = transparent_silicon.markets.find(m => m.game_id === encrypted_market.game_id && m.location_id === encrypted_market.location_id && m.drug_id === encrypted_market.drug_id);

        if (!transparent_market) return false; // No corresponding market found in transparent_silicon

        const hashCash = poseidonHashMany([BigInt(transparent_market.cash)]);
        const hashQuantity = poseidonHashMany([BigInt(transparent_market.quantity)]); 
        
        if (BigInt(encrypted_market.cash) !== hashCash || BigInt(encrypted_market.quantity) !== hashQuantity) return false;
    }

    return true;}

