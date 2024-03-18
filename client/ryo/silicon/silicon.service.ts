import { poseidonHashMany } from "@scure/starknet";
import { BlindedMarketPrice, BlindedMarketPricesPerDrugId, MarketPrice, MarketPricesPerDrugId, Trade } from './silicon.types';
import IncorrectPlayerDataException from "../../exceptions/IncorrectPlayerDataException";
import { get_player_details, get_markets_per_game_id, subscribe_to_all_world_events, get_blinded_markets_per_game_id } from "../../graphql/silicon_query";
import { PlayerData } from "./silicon.types";
import { apolloClient } from "../utils/apollo_handler";
import { BlindedMarket, BlindedMarketEdge, Market, MarketEdge } from '../../graphql/graphql';
import { parseEvent } from '../../graphql/events/events';
import { BoughtData, SoldData, WorldEvents } from '../../graphql/events/contractEvents';
import { BlindedSilicon, TransparentSilicon } from "./silicon";

class SiliconService {
    private stagedTrades: Map<string, Trade> = new Map();
    
    constructor(updateMarket: (trade: Trade) => void) {
        this.initializeWorldListener(updateMarket);
    }

    private initializeWorldListener(updateMarket: (trade: Trade) => void) {
        console.log(
            " == Starting listening on worldEvents " 
        ); 
        apolloClient.subscribe({
        query: subscribe_to_all_world_events,
        }).subscribe({
          next: (response) => {
            const event = response.data.eventEmitted;
            const parsedEvent = parseEvent(event);
            if (this.isBoughtOrSoldData(parsedEvent)){
                const key = this.getUniqueTradeKey(parsedEvent.gameId, parsedEvent.drugId, parsedEvent.playerId); 
                if (this.stagedTrades.has(key)){
                    const trade = this.stagedTrades.get(key) as Trade;
                    updateMarket(trade);
                }
            }
          },
          error(err) { console.error('Error in subscription:', err); },
        });
    }

    private isBoughtOrSoldData(event: any): event is BoughtData | SoldData {
      return event && 
        (event.eventType === WorldEvents.Bought || event.eventType === WorldEvents.Sold) &&
        'eventType' in event &&
        'eventName' in event &&
        'gameId' in event && 
        'playerId' in event && 
        'drugId' in event && 
        'quantity' in event && 
        'cost' in event;
    }

    private  getUniqueTradeKey(game_id: String, drug_id: String, player_id: String): string {
        return `${game_id}-${drug_id}-${player_id}`;
    }

    public stageTrade(game_id: number, player_id: String, location_id: String, drug_id: String, cash: bigint, quantity: bigint) {
        const key = this.getUniqueTradeKey(game_id, drug_id, player_id)
        const hashCash = poseidonHashMany([BigInt(cash)]);
        const hashQuantity = poseidonHashMany([BigInt(quantity)]);
        const trade = {
            player_id,
            game_id,
            location_id,
            drug_id,
            cash,
            quantity} as Trade
        this.stagedTrades.set(key, trade)

        return  {
                    cash: hashCash,
                    quantity: hashQuantity,
                }
        }
  
  /*
  * Check that we have a bijection between both maps. 
  */
  public verifySiliconMapping(blinded_silicon: BlindedSilicon, transparent_silicon: TransparentSilicon): boolean {
      if (blinded_silicon.markets.size !== transparent_silicon.markets.size) return false;

      for (const [key, blinded_market] of blinded_silicon.markets.entries()) {
          const transparent_market = transparent_silicon.markets.get(key);

          if (!transparent_market) return false;

          const hashCash = poseidonHashMany([BigInt(transparent_market.cash)]);
          const hashQuantity = poseidonHashMany([BigInt(transparent_market.quantity)]);

          if (BigInt(blinded_market.cash) !== hashCash || BigInt(blinded_market.quantity) !== hashQuantity) return false;
    }
    return true;
  }

  /*
  * Returns player_id, game_id and location_id as seen by the playerModel on-chain.
  * Errors can be further refined, tbd post v1 poc.
  */
 public async fetchPlayer(game_id: number, player_id: string): Promise<PlayerData> {
     try {
         const response = await apolloClient.query({
             query: get_player_details,
             variables: {
                 playerWhereInput: {
                     game_id: game_id,
                     player_id: player_id
                 }
             },
             fetchPolicy: "no-cache"

         });

         const player = response.data.playerModels.edges[0]?.node;

         if (!player) {
             throw new IncorrectPlayerDataException;
         }
     return player;
     } catch (error) {
         throw new IncorrectPlayerDataException;
      } 
 }

/*
* returns marketPrices per drug at the specified location_id; 
*/
public async fetchMarketPrices(game_id: number, location_id: string): Promise<MarketPricesPerDrugId> {
    try {
        const response = await apolloClient.query({
            query: get_markets_per_game_id,
            variables: {
                gameId: game_id
            }
        });

        const marketModels = response.data.marketModels.edges.map((edge: MarketEdge) => edge.node);

        const filteredMarketModels = marketModels.filter((model: Market) => model.location_id === location_id);

        if (filteredMarketModels.length === 0) {
            throw new Error('No market models found for the specified location_id.');
        }

        const marketPricesMapping: MarketPricesPerDrugId = filteredMarketModels.reduce((acc: MarketPricesPerDrugId, {drug_id, cash, quantity, location_id}: MarketPrice) => {
            acc[drug_id] = { cash, quantity, location_id };             
        return acc; 
        }, {});

        return marketPricesMapping;
    } catch (error) {
        throw new Error('Failed to fetch market prices.');
    }
}

/*
* returns marketPrices per drug at the specified location_id; 
*/
public async fetchBlindedMarketPrices(game_id: number, location_id: string): Promise<BlindedMarketPricesPerDrugId> {
    try {
        const response = await apolloClient.query({
            query: get_blinded_markets_per_game_id,
            variables: {
                gameId: game_id
            }
        });
        const marketModels = response.data.blindedMarketModels.edges.map((edge: BlindedMarketEdge) => edge.node);

        const filteredMarketModels = marketModels.filter((model: BlindedMarket) => model.location_id === location_id);

        if (filteredMarketModels.length === 0) {
            throw new Error('No market models found for the specified location_id.');
        }
        const marketPricesMapping: BlindedMarketPricesPerDrugId = filteredMarketModels.reduce((acc: BlindedMarketPricesPerDrugId, {drug_id, cash, quantity, location_id}: BlindedMarketPrice) => {
            acc[drug_id] = { cash, quantity, location_id };             
        return acc; 
        }, {});
        return marketPricesMapping;
    } catch (error) {
        throw new Error('Failed to fetch market prices with error');
    }
}

public async fetchMarketPrice(playerData: PlayerData, drug_id: string): Promise<BlindedMarketPrice> {
    const blindedMarkets = await this.fetchBlindedMarketPrices(playerData.game_id, playerData.location_id);
    return { drug_id:drug_id, 
             cash: blindedMarkets[drug_id].cash, 
             quantity: blindedMarkets[drug_id].quantity,
             location_id: playerData.location_id } as BlindedMarketPrice;

}

}
export default SiliconService;

