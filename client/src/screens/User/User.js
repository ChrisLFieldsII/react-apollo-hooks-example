import React from 'react';
import {useQuery, useMutation, useSubscription} from '@apollo/react-hooks';

import {listUsers} from '../../gql/queries';
import {createUser, updateUser, deleteUser} from '../../gql/mutations';
import {onCreateUser, onUpdateUser, onDeleteUser} from '../../gql/subscriptions';


function User() {
  const {data, loading} = useQuery(listUsers);
  console.log(loading, data);

  return (
    <div>
      <p>{JSON.stringify({loading, data}, null, 5)}</p>
    </div>
  )
}

export default User;