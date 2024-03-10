import { ApolloQueryResult, DocumentNode } from '@apollo/client/core';
import { getOperationName } from '@apollo/client/utilities';
import { apolloClient } from '../utils/apollo_handler';
import { MarketModelsResponse, EncryptedMarketModelsResponse } from "../../graphql/graphql";
import { BlindedMarketSilicon, MarketSilicon, TransparentMarketSilicon } from "./silidon.types";

export class Silicon<T extends MarketSilicon <bigint|number, bigint|number>> {
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

class TransparentSilicon extends Silicon<TransparentMarketSilicon> {
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
}

class EncryptedSilicon extends Silicon<BlindedMarketSilicon> {
    /*
    * fetch RYO encryptedMarketModels using graphql.
    */
    async fetchMarkets() {
        try {
            const response: ApolloQueryResult<EncryptedMarketModelsResponse> = await apolloClient.query<EncryptedMarketModelsResponse>({
                query: this.query,
            });
            response.data.encryptedMarketModels.edges
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
            console.error('Error fetching encrypted markets:', error);
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
    } else if (operationName === 'GetAllEncryptedMarkets') {
        siliconInstance = new EncryptedSilicon(query);
    } else {
        throw new Error('Unknown query operation name');
    }

    await siliconInstance.fetchMarkets();
    return siliconInstance;
}
