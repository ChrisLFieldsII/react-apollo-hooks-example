import gql from 'graphql-tag';

import {user} from '../fragments';

export const getUser = gql`
  query getUser($id:ID!) {
    getUser(id:$id) {
      ...user
    }
  }
  ${user}
`;

export const listUsers = gql`
  query listUsers {
    listUsers {
      ...user
    }
  }
  ${user}
`;