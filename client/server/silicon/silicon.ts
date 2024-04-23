import { ApolloQueryResult, DocumentNode } from '@apollo/client/core';
import { getOperationName } from '@apollo/client/utilities';
import { apolloClient } from '../utils/subscription_manager';
import { MarketModelsResponse, EncryptedMarketModelsResponse, Market, EncryptedMarket } from "../../graphql/graphql";


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

class EncryptedSilicon extends Silicon<EncryptedMarket> {
    async fetchMarkets() {
        try {
            const response: ApolloQueryResult<EncryptedMarketModelsResponse> = await apolloClient.query<EncryptedMarketModelsResponse>({
                query: this.query,
            });

            this.markets = response.data.encryptedMarketModels.edges
                .map(edge => edge.node)
                .filter((node): node is EncryptedMarket => node !== null);
        } catch (error) {
            console.error('Error fetching encrypted markets:', error);
        }
    }
}

export async function instantiate_silicon(query: DocumentNode): Promise<Silicon<Market> | Silicon<EncryptedMarket>> {
    let siliconInstance: Silicon<Market> | Silicon<EncryptedMarket>;

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
