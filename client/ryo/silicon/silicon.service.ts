import { Silicon } from './silicon'; 
import { poseidonHashMany } from "@scure/starknet";
import { BlindedMarketSilicon, MarketPrice, MarketPricesPerDrugId, TransparentMarketSilicon } from './silicon.types';
import IncorrectPlayerDataException from "../../exceptions/IncorrectPlayerDataException";
import { get_player_details, get_markets_per_game_id, subscribe_to_all_world_events } from "../../graphql/silicon_query";
import { PlayerData } from "./silicon.types";
import { apolloClient } from "../utils/apollo_handler";
import { Market, MarketEdge } from '../../graphql/graphql';
import { parseEvent } from '../../graphql/events/events';
import { BoughtData, SoldData, WorldEvents } from '../../graphql/events/contractEvents';
import { Trade } from '../ryo.types';

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

    private  getUniqueTradeKey(game_id: number, drug_id: String, player_id: string): string {
        return `${game_id}-${drug_id}-${player_id}`;
    }

  
  /*
  * Check that we have a bijection between both maps. 
  */
  public verifySiliconMapping(blinded_silicon: Silicon<BlindedMarketSilicon>, transparent_silicon: Silicon<TransparentMarketSilicon>): boolean {
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


}

export default SiliconService;
