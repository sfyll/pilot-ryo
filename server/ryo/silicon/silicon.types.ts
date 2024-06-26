
/*
 * class to store each market values.
 */
export class MarketSilicon<TCashType, TQuantityType> {
    game_id: number;
    location_id: string;
    drug_id: number;
    cash: TCashType;
    quantity: TQuantityType;

    constructor(game_id: number, location_id: string, drug_id: number, cash: TCashType, quantity: TQuantityType) {
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
 * Extend the base Market for BlindedMarket with specific types for cash and quantity.
 */
export class BlindedMarketSilicon extends MarketSilicon<bigint, bigint> {}

/*
 * Extend the base Market for TransparentMarket with specific types for cash and quantity.
 */
export class TransparentMarketSilicon extends MarketSilicon<string, bigint> {}


export interface PlayerData {
  game_id: number;
  player_id: string;
  location_id: string;
}

export type Trade = {
    player_id: string;
    game_id: number;
    location_id: string; 
    drug_id: string;
    cash: string;
    quantity: string;
}

export interface MarketPricesPerDrugId {
    [drug_id: string]: {
        cash: string,
        quantity: number,
        location_id: string
    }
}

export interface MarketPrice {
  drug_id: string;
  cash: string;
  quantity: number;
  location_id: string;
}

export interface BlindedMarketPricesPerDrugId {
    [drug_id: string]: {
        cash: string,
        quantity: string,
        location_id: string
    }
}

export interface BlindedMarketPrice {
  drug_id: string;
  cash: string;
  quantity: string;
  location_id: string;
}

