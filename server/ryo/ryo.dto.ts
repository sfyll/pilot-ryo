import "reflect-metadata";
import {
    ValidateNested,
    IsString
} from "class-validator";
import { Type } from "class-transformer";

import { IsBigIntString } from "../utils/bigint";

class TradeParametersDABodyDto {
    @IsBigIntString()
    public nonce: string;
    
    @IsBigIntString()
    public player_id: string;

    @IsBigIntString()
    public game_id: string;
}

class SignatureBodyDto {
    @IsBigIntString()
    public r: string;
    
    @IsBigIntString()
    public s : string;

    @IsBigIntString()
    public recovery: string;
}

export class TradeParametersDADto {
    @ValidateNested()
    @Type(() => TradeParametersDABodyDto)
    public tx: TradeParametersDABodyDto;

    @ValidateNested()
    @Type(() => SignatureBodyDto)
    public signature: SignatureBodyDto;
}

class TradeDaBodyDto {
    @IsBigIntString()
    public nonce: string;
    
    @IsBigIntString()
    public player_id: string;

    @IsBigIntString()
    public game_id: string;

    @IsString()
    public drug_id: string;
    
    @IsBigIntString()
    public new_cash: string;

    @IsBigIntString()
    public new_quantity: string;
}

export class TradeDADto {
    @ValidateNested()
    @Type(() => TradeDaBodyDto)
    public tx: TradeDaBodyDto;

    @ValidateNested()
    @Type(() => SignatureBodyDto)
    public signature: SignatureBodyDto;
}
