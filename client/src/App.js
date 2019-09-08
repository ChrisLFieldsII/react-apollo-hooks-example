import React from 'react';
import {ApolloProvider} from '@apollo/react-hooks';

import initClient from './initClient';
import User from './screens/User/User';

import './App.css';

const client = initClient();

function App() {
  
  return (
    <div className="App">
      <ApolloProvider client={client}>
        <User />
      </ApolloProvider>
    </div>
  );
}

export default App;
