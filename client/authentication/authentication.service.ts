import IncorrectPlayerDataException from "../exceptions/IncorrectPlayerDataException";
import { get_player_details } from "../ryo/silicon/silicon_query";
import { PlayerData } from "../ryo/silicon/types";
import { apolloClient } from "../ryo/utils/subscription_manager";

class AuthenticationService {

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

export default AuthenticationService;
