import { Router, Request, Response, NextFunction } from "express";
import authMiddleware from "../middleware/auth.middleware";
import validationMiddleware from "../middleware/validation.middleware";
import Controller from "../interfaces/controller.interface";
import { RequestWithSignature } from "../interfaces/request.interface";
import AuthenticationService from "./authentication.service";
import {
    tradeParametersActionTypeLabel,
    tradeParametersActionTypes,
    tradeParametersActionDomain,
} from "./authentication.types";
import { PlayerDetailsDto  } from "./authentication.dto";

class AuthenticationController implements Controller {
    public path = "/authentication";
    public router = Router();
    public authenticationService: AuthenticationService;

    constructor(authenticationService: AuthenticationService) {
        this.authenticationService = authenticationService;
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}/action`,
            validationMiddleware(PlayerDetailsDto),
            authMiddleware(
                tradeParametersActionTypes,
                `${tradeParametersActionTypeLabel}Tx`,
                tradeParametersActionDomain,
            ),
            this.action,
        );
    }

    /*
     * Retrieves current nonce for requested address.
     */
    //private trade_parameters = async (
    //    request: Request,
    //    response: Response,
    //) => {
    //    const address: string = request.body.address;
    //        response.send({
    //            nonce: this.authenticationService.fetchPlayer(address).toString(),
    //        });
    //        return;
    //};

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
}

export default AuthenticationController;
