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

export const get_player_details = gql`
    query getUser($playerWhereInput: PlayerWhereInput!) {
      playerModels(where: $playerWhereInput) {
        edges {
          node {
            game_id
            player_id
          }
        }
      }
    }
`;




