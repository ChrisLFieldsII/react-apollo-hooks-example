import gql from 'graphql-tag';

import {user} from '../fragments';

export const onCreateUser = gql`
  subscription onCreateUser {
    onCreateUser {
      ...user
    }
  }
  ${user}
`;

export const onUpdateUser = gql`
  subscription onUpdateUser {
    onUpdateUser {
      ...user
    }
  }
  ${user}
`;

export const onDeleteUser = gql`
  subscription onDeleteUser {
    onDeleteUser {
      ...user
    }
  }
  ${user}
`;
