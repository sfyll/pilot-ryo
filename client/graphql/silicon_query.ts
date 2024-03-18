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

export const GET_ALL_BLINDED_MARKETS_QUERY = gql`
    query GetAllBlindedMarkets {
        blindedMarketModels(first: 36) {
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
            location_id
          }
        }
      }
    }
`;

export const get_markets_per_game_id = gql`
                query MarketPrices($gameId: Int!) {
                    marketModels(first: 36, where: {game_id: $gameId}) {
                        edges {
                            node {
                                drug_id
                                location_id
                                quantity
                                cash
                            }
                        }
                    }
                }
            `

export const get_blinded_markets_per_game_id = gql`
                query MarketPrices($gameId: Int!) {
                    blindedMarketModels(first: 36, where: {game_id: $gameId}) {
                        edges {
                            node {
                                drug_id
                                location_id
                                quantity
                                cash
                            }
                        }
                    }
                }
            `

export const subscribe_to_all_world_events = gql`
    subscription {
      eventEmitted {
        id
        keys
        data
        transactionHash
      }
    }
`
