import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/react-hooks';

import { listUsers } from '../../gql/queries';
import { createUser, updateUser, deleteUser } from '../../gql/mutations';
import { onCreateUser, onUpdateUser, onDeleteUser } from '../../gql/subscriptions';
import { noop, getHeight, getWidth, COLORS } from '../../utils';

const NUM_COLUMNS = 1;

const styles = {
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}

function UserForm({ stateTuple, setIsRenderForm }) {
  // const [formState, setFormState] = stateTuple;

  const [createUserFn] = useMutation(createUser);
  const [updateUserFn] = useMutation(updateUser);  

  const closeForm = () => setIsRenderForm(false);

  return (
    <SafeAreaView>
      <TouchableOpacity onPress={closeForm}>
        <Text style={{color:COLORS.BLUE}}>Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const userStyles = StyleSheet.create({
  addUserBtn: {
    position: 'absolute',
    right: getWidth() * .15,
    backgroundColor: COLORS.BLUE,
    width: getWidth() * .3,
    padding: 10,
    borderRadius: 4
  },
  centerFlex: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginLeft: 20,
    width: getWidth(),
  },
});

// #region USER
function User() {
  const {data, loading, refetch, error} = useQuery(listUsers, {fetchPolicy:'cache-and-network'});
  const [isRenderForm, setIsRenderForm] = useState(false);

  if (isRenderForm) {
    return (
      <UserForm setIsRenderForm={setIsRenderForm} />
    )
  }

  console.log(data, loading);

  if (loading) {
    return (
      <View style={userStyles.centerFlex}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={userStyles.centerFlex}>
        <Text style={{color:'red'}}>{JSON.stringify(error, null, 5)}</Text>
      </View>
    );
  }
  
  const users = data ? data.listUsers : [];

  if (!users.length) return renderListEmpty();

  const openForm = () => setIsRenderForm(true);

  return (
    <SafeAreaView>
      <View style={[userStyles.header]}>
        <Text style={{fontSize:28, fontWeight:'bold'}}>{`${users.length} Users`}</Text>
        <TouchableOpacity onPress={openForm} style={[styles.center, userStyles.addUserBtn]}>
          <Text style={{color:'white'}}>Add User</Text>
        </TouchableOpacity>
      </View>
      <FlatList 
        data={users}
        renderItem={renderUser}
        keyExtractor={user => user.id}
        onRefresh={refetch}
        refreshing={loading}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{ paddingBottom:50 }}
      />
    </SafeAreaView>
  )
}

function renderListEmpty() {
  return (
    <View style={userStyles.centerFlex}>
      <Text>No Users</Text>
    </View>
  )
}

function renderUser({ item: user }) {
  return (
    <UserCard user={user} />
  )
}
// #endregion USER

const CARD_MARGIN = 20;
const CARD_HEIGHT_PERCENTAGE = .5;

const cardStyles = StyleSheet.create({
  container: {
    width: (getWidth() / NUM_COLUMNS) - (CARD_MARGIN * 2),
    height: getHeight() * CARD_HEIGHT_PERCENTAGE,
    margin: CARD_MARGIN,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,.03)'
  },
  header: {
    fontSize:20,
    fontWeight:'bold',
  },
  btnContainer: {
    // flex: 1,
    flexDirection: 'row',
  }
});

function UserCard({
  user={},
  onEdit=noop,
  onDelete=noop,
}) {
  const width = (getWidth() / NUM_COLUMNS) - (CARD_MARGIN * 2);
  const height = getHeight();
  return (
    <View style={[cardStyles.container]}>
      {/* Header */}
      <View style={[styles.center, { backgroundColor: 'rgba(0,0,0,.03)', height: height * CARD_HEIGHT_PERCENTAGE * 0.25 }]}>
        <Text style={cardStyles.header}>{`${user.name} - ${user.age}`}</Text>
      </View>
      {/* Color Block */}
      <View style={[styles.center, {backgroundColor:user.favColor, height: height * CARD_HEIGHT_PERCENTAGE * 0.6}]}>
        <Text>{user.favColor}</Text>
      </View>
      {/* Action Btn Block */}
      <View style={[cardStyles.btnContainer]}>
        <TouchableOpacity style={[styles.center, { borderColor: COLORS.BLUE, borderRadius:4, borderWidth:1, width: (width / 2)-1, height: height * CARD_HEIGHT_PERCENTAGE * 0.15 }]}>
          <Text>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.center, { borderColor: COLORS.RED, borderRadius:4, borderWidth:1, width: (width / 2)-1, height: height * CARD_HEIGHT_PERCENTAGE * 0.15 }]}>
          <Text>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default User;
