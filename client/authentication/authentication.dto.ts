import "reflect-metadata";
import { ValidateNested } from "class-validator";
import { IsBigIntString } from "../utils/bigint";
import { Type } from "class-transformer";

export class NonceDto {
    @IsBigIntString()
    public address: string;
}

class ActionTxDto {
    @IsBigIntString()
    public nonce: string;
}
export class ActionDto {
    @ValidateNested()
    @Type(() => ActionTxDto)
    public tx: ActionTxDto;

    @IsBigIntString()
    public signature: string;
}