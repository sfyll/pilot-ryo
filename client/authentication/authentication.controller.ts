import { Router, Request, Response, NextFunction } from "express";
import authMiddleware from "../middleware/auth.middleware";
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
            validationMiddleware(NonceDto),
            this.nonce,
        );
        this.router.post(
            `${this.path}/action`,
            validationMiddleware(ActionDto),
            authMiddleware(
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
    ) => {
        const address: string = request.body.address;
            response.send({
                nonce: this.authenticationService.getNonce(address).toString(),
            });
            return;
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
}

export default AuthenticationController;
