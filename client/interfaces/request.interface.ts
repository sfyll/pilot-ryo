import { Request } from "express";

export interface RequestWithSignature extends Request {
    // [TODO] refactor to match EVM msg.{data, gas, sig, value}
    body: {
        signature: string;
        tx: {
            nonce: string;
            body: { [key: string]: any };
        };
        sender?: string;
    };
}

export type RequestWithBody<T> = RequestWithSignature & {
    body: {
        tx: {
            body: T;
        };
    };
};

export interface RequestWithContract extends Request {
    body: {
        newContract: string;
    };
}

export type RequestWithUpgradeContract = RequestWithContract;
