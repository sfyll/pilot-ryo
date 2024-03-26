import { Router, Request, Response, NextFunction } from "express";
import { isAddress } from "viem";

import InvalidAddressException from "../exceptions/InvalidAddressException";
import { starknetAuthhMiddleware } from "../middleware/auth.middleware";
import validationMiddleware from "../middleware/validation.middleware";
import Controller from "../interfaces/controller.interface";
import { RequestWithSignature } from "../interfaces/request.interface";
import AuthenticationService from "./authentication.service";
import {
    nonceActionDomain,
    nonceActionTypes,
    nonceActionTypeLabel,
} from "./authentication.types";
import { NonceDto, ActionDto } from "./authentication.dto";
import { isStarknetAddress } from "../utils/starknetAddress";

class AuthenticationController implements Controller {
    public path = "/authentication";
    public router = Router();
    public authenticationService: AuthenticationService;

    constructor(authenticationService: AuthenticationService) {
        this.authenticationService = authenticationService;
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            `${this.path}/nonce`,
            this.logRequestDetails,
            validationMiddleware(NonceDto, false, 'query'),
            this.nonce,
        );
        this.router.post(
            `${this.path}/action`,
            validationMiddleware(ActionDto),
            starknetAuthhMiddleware(
                nonceActionTypes,
                `${nonceActionTypeLabel}Tx`,
                nonceActionDomain,
            ),
            this.action,
        );
    }

    /*
     * Retrieves current nonce for requested address.
     */
    private nonce = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const address: string = request.query.address as string;
        if (isAddress(address) || isStarknetAddress(address)) {
            response.send({
                nonce: this.authenticationService.getNonce(address).toString(),
            });
            return;
        }
        else {
            next(new InvalidAddressException());
        }
    };

    /*
     * A dummy action function to test middlware during development. Doesn't do
     * anything.
     */
    private action = async (
        request: RequestWithSignature,
        response: Response,
    ) => {
        response.status(200).send({});
    };
    
    /*
     * A debugging function to log request path and arrival time. 
     */
    private logRequestDetails = (req: Request, _: Response, next: NextFunction) => {
        const now = new Date();
            console.log(
                `  == Received request for ${req.path} at ${now.toISOString()} ` 
            ); 
        next();
    };
}

export default AuthenticationController;
