import { GET_ALL_MARKETS_QUERY, GET_ALL_BLINDED_MARKETS_QUERY } from "../graphql/silicon_query";
import { BlindedSilicon, TransparentSilicon, instantiate_silicon } from "./silicon/silicon";
import  SiliconService from "./silicon/silicon.service"; 

import { Router, Request, Response, NextFunction } from "express";
import Controller from "../interfaces/controller.interface";
import { PlayerData } from "./silicon/silicon.types";

import { starknetAuthhMiddleware } from "../middleware/auth.middleware";
import validationMiddleware from "../middleware/validation.middleware";
import { TradeDADto, TradeParametersDADto} from "./ryo.dto";
import { tradeParametersDAReqTyped, tradeDAReqTyped, tradeDAActionTypes, tradeDAActionTypeLabel, tradeDAActionDomain} from "./ryo.types";
import PlayerAtHomeException from "../exceptions/PlayerAHomeException";
import { StarknetRequestWithSignature } from "../interfaces/request.interface";
import { getMessageHash, signTypedDataStarknet } from "../utils/signature";
import { Account } from "starknet";
import { setupDojoProviderSeismic } from "./utils/starknet_handler";
import { stringifyBigInts } from "../utils/bigint";

class RyoController implements Controller {
    public path = "/trade";
    public router = Router();
    private transparent_silicon: TransparentSilicon;
    private blinded_silicon: BlindedSilicon;
    private silicon_service: SiliconService;
    private walletClient: Account;
    private seismicStarknetContractAddress: string; 

    constructor() {
        this.initializeRoutes();
        this.seismicStarknetContractAddress = process.env.VERIFIER_CONTRACT_ADDRESS as string;
    }

    private initializeRoutes() {
        this.router.post(
                    `${this.path}/tradeParameters`,
                    this.logRequestDetails,
                    validationMiddleware(TradeParametersDADto),
                    starknetAuthhMiddleware(
                        tradeParametersDAReqTyped.types,
                        tradeParametersDAReqTyped.primaryType,
                        tradeParametersDAReqTyped.domain,
                    ),
                    this.tradeParameters,
                );
        this.router.post(
                    `${this.path}/tradeDavail`,
                    this.logRequestDetails,
                    validationMiddleware(TradeDADto),
                    starknetAuthhMiddleware(
                        tradeDAReqTyped.types,
                        tradeDAReqTyped.primaryType,
                        tradeDAReqTyped.domain,
                    ),
                    this.logRequestDetails,
                    this.tradeDavail,
                );

        this.router.get(`${this.path}/getseismicaddress`, (_, res) => {
            res.send({
                seismicStarknetContractAddress: this.seismicStarknetContractAddress,
            });
        });
    }

    /*
     * Initializes both Blinded and Transparent States.
     * Constrains Controller to have knowledge of all pre-images.
    */
    public async initializeStates() {
        this.transparent_silicon = await instantiate_silicon(GET_ALL_MARKETS_QUERY) as TransparentSilicon;
        this.blinded_silicon = await instantiate_silicon(GET_ALL_BLINDED_MARKETS_QUERY) as BlindedSilicon;
        this.silicon_service = new SiliconService(this.transparent_silicon.updateMarket.bind(this.transparent_silicon))
        this.silicon_service.verifySiliconMapping(this.blinded_silicon, this.transparent_silicon);
    }

    public async initializeClient() {
        this.walletClient = await setupDojoProviderSeismic();
    }

    /*
    * Return pool cash and quantity parameters if the user meets the predicates
    */
    private tradeParameters = async (
        request: StarknetRequestWithSignature,
        response: Response,
        next: NextFunction,
    ) => {
        const playerData = await this.fetchPlayerData(request);
        if (playerData.location_id == "Home") {
            next(new PlayerAtHomeException());
            return;        
        }
        else {
            console.log(
                `  == Sending the pools parameters to the users upon predicates verification ` 
            ); 
            const pricePerDrugId = await this.silicon_service.fetchMarketPricesFromSilicon(this.transparent_silicon, playerData.game_id, playerData.location_id);
            response.json(pricePerDrugId);
        }
        };
    /*
    * Stores the pre-image of a swipe and returns a data availability
    * signature.
    */
    private tradeDavail = async (
        request: StarknetRequestWithSignature,
        response: Response,
        next: NextFunction,
    ) => {
        const playerData = await this.fetchPlayerData(request)
        const tx = this.silicon_service.stageTrade(playerData.game_id, playerData.player_id, playerData.location_id, request.body.tx.drug_id,
                                                   request.body.tx.new_cash, request.body.tx.new_quantity)

        const signature = await signTypedDataStarknet(this.walletClient, tradeDAActionTypes, tradeDAActionTypeLabel, tradeDAActionDomain, tx)
        const commitment = await getMessageHash(this.walletClient, tradeDAActionTypes, tradeDAActionTypeLabel, tradeDAActionDomain, tx)
        response.send({commitment: commitment, signature:stringifyBigInts(signature)})
        }

    private logRequestDetails = (req: Request, _: Response, next: NextFunction) => {
        const now = new Date();
            console.log(
                `  == Received request for ${req.path} at ${now.toISOString()} ` 
            ); 
        next();
    };

    private async fetchPlayerData(request: StarknetRequestWithSignature): Promise<PlayerData> {
        const address: string = request.body.tx.player_id as string;
        const game_id: number = Number(request.body.tx.game_id) ;
        return  await this.silicon_service.fetchPlayer(game_id, address); 
    }
}

export async function getRyoController(): Promise<RyoController> {
    const ryo_controller = new RyoController();
    await ryo_controller.initializeStates();
    await ryo_controller.initializeClient();
    return ryo_controller
}


