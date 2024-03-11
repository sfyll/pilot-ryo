import { GET_ALL_MARKETS_QUERY, GET_ALL_BLINDED_MARKETS_QUERY } from "../graphql/silicon_query";
import { Silicon, instantiate_silicon } from "./silicon/silicon";
import  SiliconService from "./silicon/silicon.service"; 

import { Router, Request, Response, RequestHandler } from "express";
import Controller from "../interfaces/controller.interface";
import { BlindedMarketSilicon, TransparentMarketSilicon } from "./silicon/silidon.types";

import { starknetAuthhMiddleware } from "../middleware/auth.middleware";
import validationMiddleware from "../middleware/validation.middleware";
import { TradeParametersDADto} from "./ryo.dto";
import { tradeParametersDAReqTyped } from "./ryo.types";

class RyoController implements Controller {
    public path = "/trade";
    public router = Router();
    private transparent_silicon: Silicon<TransparentMarketSilicon>;
    private blinded_silicon: Silicon<BlindedMarketSilicon>;
    private silicon_service: SiliconService = new SiliconService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
                    `${this.path}/tradeParameters`,
                    validationMiddleware(TradeParametersDADto),
                    starknetAuthhMiddleware(
                        tradeParametersDAReqTyped.types,
                        tradeParametersDAReqTyped.primaryType,
                        tradeParametersDAReqTyped.domain,
                    ),
                    this.ping,
                );
    }

    /*
     * Initializes both Blinded and Transparent States.
     * Constrains Controller to have knowledge of all pre-images.
    */
    public async initializeStates() {
        this.transparent_silicon = await instantiate_silicon(GET_ALL_MARKETS_QUERY) as Silicon<TransparentMarketSilicon>;
        this.blinded_silicon = await instantiate_silicon(GET_ALL_BLINDED_MARKETS_QUERY) as Silicon<BlindedMarketSilicon>;
        this.silicon_service.verifySiliconMapping(this.blinded_silicon, this.transparent_silicon);
    }

    private ping = (req: Request, res: Response) => {
        res.status(200).send({ message: 'Pong!' });
    };
}

export async function getRyoController(): Promise<RyoController> {
    const ryo_controller = new RyoController();
    await ryo_controller.initializeStates();
    return ryo_controller
}


