import { onError } from 'apollo-link-error';
import { from, split } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

const initClient = () => {
  const httpLink = createHttpLink({ uri: 'http://localhost:4000' });

  const errorLink = onError(({ graphQLErrors, networkError, operation, response }) => {
    console.error(operation, response);
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
      );

    if (networkError) console.error(`[Network error]: ${networkError}`);
  });

  const wsLink = new WebSocketLink({
    uri: `ws://localhost:4000`,
    options: {
      reconnect: true,
    },
  });

  const link = split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    from([errorLink, wsLink]),
    from([errorLink, httpLink]),
  );

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });

  return client;
};

export default initClient;
