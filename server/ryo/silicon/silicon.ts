import { ApolloQueryResult, DocumentNode } from '@apollo/client/core';
import { getOperationName } from '@apollo/client/utilities';
import { apolloClient } from '../utils/apollo_handler';
import { MarketModelsResponse, BlindedMarketModelsResponse } from "../../graphql/graphql";
import { BlindedMarketSilicon, MarketSilicon, Trade, TransparentMarketSilicon } from "./silicon.types";

class Silicon<T extends MarketSilicon <bigint|string, bigint|number>> {
    protected query: any;
    public markets: Map<string, T>;

    constructor(query: any) {
        this.query = query;
        this.markets = new Map<string, T>();
    }

    async fetchMarkets(): Promise<void> {
        throw new Error("Method 'fetchMarkets' must be implemented.");
    }
}

export class TransparentSilicon extends Silicon<TransparentMarketSilicon> {
    /*
    * fetch RYO marketModels using graphql.
    */
    async fetchMarkets() {
        try {
            const response: ApolloQueryResult<MarketModelsResponse> = await apolloClient.query<MarketModelsResponse>({
                query: this.query,
            });

            response.data.marketModels.edges
                .map(edge => new TransparentMarketSilicon(
                    edge.node!.game_id,
                    edge.node!.location_id,
                    edge.node!.drug_id,
                    edge.node!.cash,
                    edge.node!.quantity
                ))
                .filter((market): market is TransparentMarketSilicon => market !== null)
                .forEach(market => {
                    this.markets.set(market.uniqueKey, market);
                });

        } catch (error) {
            console.error('Error fetching transparent markets:', error);
        }
    }
    
    /*
    * Update market with new pool values on emitted bought or sold event.
    */
    public updateMarket(trade: Trade) {
        console.log(
            `  == Trade confirmed on-chain. Updating ${trade.drug_id} market to this cash value: ${trade.cash}, and this quantity value: ${trade.quantity} ` 
        ); 
        const key = TransparentSilicon.get_key(trade.game_id, trade.location_id, trade.drug_id)
        const market = new TransparentMarketSilicon(
            trade.game_id,
            trade.location_id,
            trade.game_id,
            '0x' + parseInt(trade.cash, 10).toString(16),
            BigInt(parseInt(trade.quantity, 10))
        )
        this.markets.set(key, market)  
    }
    public static get_key(game_id: number, location_id: string, drug_id: string) {
        return `${game_id}-${location_id}-${drug_id}`; 
    }
}

export class BlindedSilicon extends Silicon<BlindedMarketSilicon> {
    /*
    * fetch RYO BlindedMarketModels using graphql.
    */
    async fetchMarkets() {
        try {
            const response: ApolloQueryResult<BlindedMarketModelsResponse> = await apolloClient.query<BlindedMarketModelsResponse>({
                query: this.query,
            });
            response.data.blindedMarketModels.edges
                .map(edge => new BlindedMarketSilicon(
                    edge.node!.game_id,
                    edge.node!.location_id,
                    edge.node!.drug_id,
                    edge.node!.cash,
                    edge.node!.quantity
                ))
                .filter((market): market is BlindedMarketSilicon => market !== null)
                .forEach(market => {
                    this.markets.set(market.uniqueKey, market);
                });

        } catch (error) {
            console.error('Error fetching Blinded markets:', error);
        }
    }
}
/*
* Instantiate blinded and transparent silicon, and verify knowledge of the complete pre-image:image mapping.
*/
export async function instantiate_silicon(query: DocumentNode): Promise<Silicon<TransparentMarketSilicon> | Silicon<BlindedMarketSilicon>> {
    let siliconInstance: Silicon<TransparentMarketSilicon> | Silicon<BlindedMarketSilicon>;

    const operationName = getOperationName(query) 

    if (operationName === 'GetAllMarkets') {
        siliconInstance = new TransparentSilicon(query);
    } else if (operationName === 'GetAllBlindedMarkets') {
        siliconInstance = new BlindedSilicon(query);
    } else {
        throw new Error('Unknown query operation name');
    }

    await siliconInstance.fetchMarkets();
    return siliconInstance;
}
