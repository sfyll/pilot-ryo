import { gql } from '@apollo/client/core';

export const GET_ALL_MARKETS_QUERY = gql`
    query GetAllMarkets {
        marketModels(first: 36) {
            edges {
                node {
                    game_id
                    location_id
                    drug_id
                    cash
                    quantity
                }
            }
            totalCount
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`;

export const GET_ALL_ENCRYPTED_MARKETS_QUERY = gql`
    query GetAllEncryptedMarkets {
        encryptedMarketModels(first: 36) {
            edges {
                node {
                    game_id
                    location_id
                    drug_id
                    cash
                    quantity
                }
            }
            totalCount
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`;


