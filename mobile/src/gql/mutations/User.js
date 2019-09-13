import gql from 'graphql-tag';

import {user} from '../fragments';

export const createUser = gql`
  mutation createUser($input: UserCreateInput!) {
    createUser(input:$input) {
      ...user
    }
  }
  ${user}
`;

export const updateUser = gql`
  mutation updateUser($id: ID!, $input: UserUpdateInput!) {
    updateUser(id: $id, input: $input) {
      ...user
    }
  }
  ${user}
`;

export const deleteUser = gql`
  mutation deleteUser($id: ID!) {
    deleteUser(id: $id) {
      ...user
    }
  }
  ${user}
`;