import { Silicon } from './silicon'; 
import { poseidonHashMany } from "@scure/starknet";
import { BlindedMarketSilicon, TransparentMarketSilicon } from './silidon.types';
import IncorrectPlayerDataException from "../../exceptions/IncorrectPlayerDataException";
import { get_player_details } from "../../graphql/silicon_query";
import { PlayerData } from "./silidon.types";
import { apolloClient } from "../utils/apollo_handler";

class SiliconService {
  
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
  * Returns player_id and game_id as seen by the playerModel on-chain.
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
             }
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

}

export default SiliconService;
