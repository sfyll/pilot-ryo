import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import 'cross-fetch/polyfill';
import { WebSocket } from "ws";

(global as any).WebSocket = WebSocket;
export function createApolloClient() {
  
  const httpLink = new HttpLink({
      uri: 'http://0.0.0.0:8080/graphql',
      fetch
  });

  const wsLink = new GraphQLWsLink(createClient({
      url: 'ws://0.0.0.0:8080/graphql/ws',
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

export const apolloClient = createApolloClient();

