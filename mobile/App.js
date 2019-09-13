import React from 'react';
import {
  StyleSheet,
} from 'react-native';

import {ApolloProvider} from '@apollo/react-hooks';

import initClient from './initClient';
import DevMenuTrigger from './DevMenuTrigger';
import User from './src/screens/User/User';

const client = initClient();

const App = () => {
  return (
    <DevMenuTrigger>
      <ApolloProvider client={client}>
        <User />
      </ApolloProvider>
    </DevMenuTrigger>
  );
};

export default App;
