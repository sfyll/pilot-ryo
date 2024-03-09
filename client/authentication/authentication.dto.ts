import "reflect-metadata";
import { IsBigIntString } from "../utils/bigint";

export class PlayerDetailsDto { 
    @IsBigIntString()
    player_id: string
    
    @IsBigIntString()
    game_id: string
}
