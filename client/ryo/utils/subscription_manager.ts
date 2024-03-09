import { ApolloClient, InMemoryCache, HttpLink, split, NormalizedCacheObject } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { WebSocket } from "ws";

(global as any).WebSocket = WebSocket;

export const apolloClient = createApolloClient();

export function createApolloClient() : ApolloClient<NormalizedCacheObject> {
  if (typeof apolloClient !== 'undefined') return apolloClient;
  const httpLink = new HttpLink({
      uri: process.env.GQL_URL,
      fetch
  });

  const wsLink = new GraphQLWsLink(createClient({
      url: process.env.GQL_URL_WSS as string,
      webSocketImpl: WebSocket,
  }));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);
  const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });

  return client;
}


