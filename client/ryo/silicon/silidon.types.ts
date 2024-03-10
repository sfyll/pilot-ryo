
/*
 * class to store each market values.
 */
export class MarketSilicon<TCashType, TQuantityType> {
    game_id: number;
    location_id: number;
    drug_id: number;
    cash: TCashType;
    quantity: TQuantityType;

    constructor(game_id: number, location_id: number, drug_id: number, cash: TCashType, quantity: TQuantityType) {
        this.game_id = game_id;
        this.location_id = location_id;
        this.drug_id = drug_id;
        this.cash = cash;
        this.quantity = quantity;
    }

    /*
     * Method to generate a unique key from the properties, reflecting the object native indexing.
     */
    get uniqueKey(): string {
        return `${this.game_id}-${this.location_id}-${this.drug_id}`;
    }
}

/*
 * Extend the base Market for EncryptedMarket with specific types for cash and quantity.
 */
export class EncryptedMarketSilicon extends MarketSilicon<bigint, bigint> {}

/*
 * Extend the base Market for TransparentMarket with specific types for cash and quantity.
 */
export class TransparentMarketSilicon extends MarketSilicon<number, number> {}


export interface PlayerData {
  game_id: number;
  player_id: string;
}