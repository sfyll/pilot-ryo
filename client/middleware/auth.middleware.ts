import { NextFunction, Request, Response, RequestHandler } from "express";
import { EIP712DomainType, EIP712Types } from "../interfaces/eip712.interface";
import { recoverTypedMessageAddress } from "../utils/signature";
import { handleAsync } from "../utils/error";
import AuthenticationService from "../authentication/authentication.service";
import { RequestWithSignature, StarknetRequestWithSignature } from "../interfaces/request.interface";
import InvalidSignatureException from "../exceptions/InvalidSignatureException";
import { StarkNetDomain, typedData } from "starknet";
import { getStarknetTypedDataWithMessage } from "../ryo/ryo.types";
import { getContractAccount } from "../ryo/utils/starknet_handler";

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

/*
 * Authenticates an incoming request by checking whether the singer has not
 * used this nonce before, applied to starknet signatures.
 */
export  function starknetAuthhMiddleware<T>(
    dataTypes: EIP712Types,
    dataPrimary: string,
    dataDomain: StarkNetDomain,
): RequestHandler {
    async function auth(
        request: StarknetRequestWithSignature,
        response: Response,
        next: NextFunction,
    ) {
        const contractAccount = getContractAccount(request.body.tx.player_id);

        let typedDataValidate = getStarknetTypedDataWithMessage(dataTypes, dataPrimary, dataDomain, request.body.tx);

        const msgHash = typedData.getMessageHash(typedDataValidate, request.body.tx.player_id); 
        
        try {
          await contractAccount.isValidSignature(msgHash, [request.body.signature.r, request.body.signature.s]);
          const authenticationService = request.app.get(
            "authenticationService",
        ) as AuthenticationService;

        request.body["sender"] = request.body.tx.player_id;
        next();
        } catch (error) {
            next(new InvalidSignatureException());
            return;
        }
    }
    return auth;
}

