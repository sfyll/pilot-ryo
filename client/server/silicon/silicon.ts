import { ApolloQueryResult, DocumentNode } from '@apollo/client/core';
import { getOperationName } from '@apollo/client/utilities';
import { apolloClient } from '../utils/subscription_manager';
import { MarketModelsResponse, BlindedMarketModelsResponse, Market, BlindedMarket } from "../../graphql/graphql";


export class Silicon<T> {
    protected query: any;
    public markets: T[];

    constructor(query: any) {
        this.query = query;
        this.markets = [];
    }

    async fetchMarkets(): Promise<void> {
        throw new Error("Method 'fetchMarkets' must be implemented.");
    }
}

class TransparentSilicon extends Silicon<Market> {
    async fetchMarkets() {
        try {
            const response: ApolloQueryResult<MarketModelsResponse> = await apolloClient.query<MarketModelsResponse>({
                query: this.query,
            });

            this.markets = response.data.marketModels.edges
                .map(edge => edge.node)
                .filter((node): node is Market => node !== null);
        } catch (error) {
            console.error('Error fetching transparent markets:', error);
        }
    }
}

class BlindedSilicon extends Silicon<BlindedMarket> {
    async fetchMarkets() {
        try {
            const response: ApolloQueryResult<BlindedMarketModelsResponse> = await apolloClient.query<BlindedMarketModelsResponse>({
                query: this.query,
            });

            this.markets = response.data.blindedMarketModels.edges
                .map(edge => edge.node)
                .filter((node): node is BlindedMarket => node !== null);
        } catch (error) {
            console.error('Error fetching Blinded markets:', error);
        }
    }
}

export async function instantiate_silicon(query: DocumentNode): Promise<Silicon<Market> | Silicon<BlindedMarket>> {
    let siliconInstance: Silicon<Market> | Silicon<BlindedMarket>;

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
