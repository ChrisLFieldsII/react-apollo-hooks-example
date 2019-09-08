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
  mutation updateUser($input: UserUpdateInput!) {
    updateUser(input: $input) {
      ...user
    }
  }
  ${user}
`;

export const deleteUser = gql`
  mutation deleteUser($input: UserDeleteInput) {
    deleteUser(input: $input) {
      ...user
    }
  }
  ${user}
`;