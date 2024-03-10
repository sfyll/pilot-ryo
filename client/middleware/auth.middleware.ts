import { NextFunction, Request, Response, RequestHandler } from "express";

import { EIP712Types, EIP712DomainType, StarknetEIP712DomainType } from "../interfaces/eip712.interface";
import { recoverTypedMessageAddress } from "../utils/signature";
import { handleAsync } from "../utils/error";
import AuthenticationService from "../authentication/authentication.service";
import { RequestWithSignature } from "../interfaces/request.interface";
import InvalidSignatureException from "../exceptions/InvalidSignatureException";

/*
 * Authenticates an incoming request by checking whether the singer has not
 * used this nonce before.
 */
export function authMiddleware<T>(
    dataTypes: EIP712Types,
    dataPrimary: string,
    dataDomain: EIP712DomainType,
): RequestHandler {
    async function auth(
        request: RequestWithSignature,
        response: Response,
        next: NextFunction,
    ) {
        let [sender, err] = await handleAsync(
            recoverTypedMessageAddress(
                request.body.signature,
                dataTypes,
                dataPrimary,
                dataDomain,
                request.body.tx,
            ),
        );
        if (sender === null || err) {
            next(new InvalidSignatureException());
            return;
        }

        const authenticationService = request.app.get(
            "authenticationService",
        ) as AuthenticationService;

        request.body["sender"] = sender;
        next();
    }
    return auth;
}

export function starknetAuthhMiddleware<T>(
    dataTypes: EIP712Types,
    dataPrimary: string,
    dataDomain: StarknetEIP712DomainType,
): RequestHandler {
    async function auth(
        request: RequestWithSignature,
        response: Response,
        next: NextFunction,
    ) {
        console.log(dataTypes);
        console.log(dataPrimary);
        console.log(dataDomain);
           }
    return auth;
}

