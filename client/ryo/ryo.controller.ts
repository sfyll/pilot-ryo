import { GET_ALL_MARKETS_QUERY, GET_ALL_ENCRYPTED_MARKETS_QUERY } from "./silicon/silicon_query";
import { Silicon, instantiate_silicon } from "./silicon/silicon";
import { verifySiliconMapping } from "./silicon/silicon_utils"; 

import { Router, Request, Response } from "express";
import Controller from "../interfaces/controller.interface";
import { EncryptedMarketSilicon, TransparentMarketSilicon } from "./silicon/types";

class RyoController implements Controller {
    public path = "/trade";
    public router = Router();
    private transparent_silicon: Silicon<TransparentMarketSilicon>;
    private encrypted_silicon: Silicon<EncryptedMarketSilicon>;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/ping`, this.ping);
    }

    /*
     * Initializes both Encrypted and Transparent States.
     * Constrains Controller to have knowledge of all pre-images.
    */
    public async initializeStates() {
        this.transparent_silicon = await instantiate_silicon(GET_ALL_MARKETS_QUERY) as Silicon<TransparentMarketSilicon>;
        this.encrypted_silicon = await instantiate_silicon(GET_ALL_ENCRYPTED_MARKETS_QUERY) as Silicon<EncryptedMarketSilicon>;
        verifySiliconMapping(this.encrypted_silicon, this.transparent_silicon);
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


