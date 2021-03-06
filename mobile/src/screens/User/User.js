import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, TextInput, KeyboardAvoidingView, Keyboard} from 'react-native';
import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/react-hooks';
import { ColorWheel } from 'react-native-color-wheel';
import colorsys from 'colorsys';

import { listUsers } from '../../gql/queries';
import { createUser, updateUser, deleteUser } from '../../gql/mutations';
import { onCreateUser, onUpdateUser, onDeleteUser } from '../../gql/subscriptions';
import { noop, getHeight, getWidth, COLORS } from '../../utils';

const NUM_COLUMNS = 1;
const INITIAL_COLOR = '#ffffff';

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  }
});

// #region USER_FORM
const userFormStyles = StyleSheet.create({
  textInput: {
    width: getWidth(),
    height: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  formContainer: {
    marginBottom: 10,
  },
  submitBtn: {
    width: getWidth() * 0.8,
    alignSelf: 'center',
    backgroundColor: COLORS.BLUE,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  colorwheelContainer: {
    width: getWidth(),
    height: getHeight() * 0.4,
    marginBottom: 30,
  },
  colorwheelThumb: {
    height: 15,
    width: 15,
    borderRadius: 15,
  },
})

function UserForm({ initUser, closeForm }) {
  const isUpdate = !!initUser.name; // if name is truthy, its an update
  const [name, setName] = useState(initUser.name || '');
  const [age, setAge] = useState(String(initUser.age || ''));
  const [color, setColor] = useState(initUser.color || INITIAL_COLOR);

  const [createUserFn] = useMutation(createUser);
  const [updateUserFn] = useMutation(updateUser);  

  const onColorChangeComplete = color => {
    let hexColor = INITIAL_COLOR;
    try {
      hexColor = colorsys.hsv2Hex(color.h, color.s, color.v);
    } catch (err) {
      console.error('onColorChangeComplete error::', err);
    }
    setColor(hexColor);
  };

  const doCreateUser = async () => {
    if (!name) {
      alert('Must input name!')
      return;
    }  

    try {
      const { data } = await createUserFn({
        variables: {
          input: {
            name: name.trim(),
            age: age === '0' ? parseInt(age) : parseInt(age || 0) || null,
            favColor: color,
          }
        }
      });

      console.log(data);
      alert(`Successfully created user ${name}!`);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error creating user');
    }
  }

  const doUpdateUser = async () => {
    try {
      const { data } = await updateUserFn({
        variables: {
          id: initUser.id,
          input: {
            name: name.trim(),
            age: age === '0' ? parseInt(age) : parseInt(age || 0) || null,
            favColor: color,
          }
        }
      });

      console.log('update user data', data);
      alert(`Successfully updated user ${name}!`);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error occurred updating user');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* This btn helps dismiss the keyboard when pressing anywhere */}
      <TouchableOpacity activeOpacity={1} onPress={Keyboard.dismiss} style={styles.container}>
        <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
          <TouchableOpacity style={{ margin: 20 }} onPress={closeForm}>
            <Text style={{ color: COLORS.BLUE }}>Go Back</Text>
          </TouchableOpacity>
          <View style={userFormStyles.formContainer}>
            <Text>Name <Text style={{ color: 'red' }}>*</Text></Text>
            <TextInput value={name} style={userFormStyles.textInput} placeholder="Sgt. Slaughter *" onChangeText={text => setName(text)} />
          </View>
          <View style={userFormStyles.formContainer}>
            <Text>Age</Text>
            <TextInput value={age} keyboardType="number-pad" style={userFormStyles.textInput} placeholder="26" onChangeText={text => setAge(text)} />
          </View>
          <Text>Color is {color}</Text>
          <View style={userFormStyles.colorwheelContainer}>
            <ColorWheel
              initialColor={color}
              // onColorChange={color => console.log({color})}
              onColorChangeComplete={onColorChangeComplete}
              thumbStyle={userFormStyles.colorwheelThumb}
            />
          </View>
          <TouchableOpacity style={userFormStyles.submitBtn} onPress={isUpdate ? doUpdateUser : doCreateUser}>
            <Text style={{ color: 'white' }}>{isUpdate ? 'Update User' : 'Create User'}</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </SafeAreaView>
  )
}
// #endregion USER_FORM

// #region USER
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
    marginBottom: 10,
    width: getWidth(),
  },
});

function handleUserOnData({ client, subscriptionData:{ data } }, refetch) {  
  /** Commented out to show logic could possibly do but we'll just refetch
   * in which case we're really better off polling!!
   */
  // const res = client.readQuery({
  //   query: listUsers
  // });

  // const [key] = Object.keys(data);
  // switch (key) {
  //   case 'onCreateUser':
  //     console.log('onCreateUser', data);
  //     res.listUsers.filter(user => user.id !== data.onCreateUser.id).concat(data.onCreateUser);
  //     break;
  //   case 'onUpdateUser':
  //     console.log('onUpdateUser', data);
  //     res.listUsers.filter(user => user.id !== data.onUpdateUser.id).concat(data.onUpdateUser);
  //     break;
  //   case 'onDeleteUser':
  //     console.warn('onDeleteUser subscriptions returns null... Possible bug??');
  //     break;
  //   default:
  //     break;
  // }

  // client.writeQuery({
  //   query: listUsers,
  //   data: res,
  // });
  
  refetch();
}

function renderListEmpty() {
  return (
    <View style={userStyles.centerFlex}>
      <Text>No Users</Text>
    </View>
  );
}

// go to the UserForm screen which uses initUser to determine whether its a create or update
function doUpdateUser(user, setRenderFormObj) {
  setRenderFormObj({ isRenderForm: true, initUser: { id: user.id, name: user.name, color: user.favColor, age: user.age } });
}

async function doDeleteUser(user, deleteUserFn) {

  try {
    const {data} = await deleteUserFn({
      variables: {
        id: user.id,
      }
    });

    console.log('delete user data', data);
    alert(`Successfully deleted user ${user.name}!`);
  } catch (err) {
    console.error(err);
    alert(err.message || 'Error occurred deleting User');
  }
}

function renderUser({ item: user }, setRenderFormObj, deleteUserFn) {
  return <UserCard user={user} doUpdate={() => doUpdateUser(user, setRenderFormObj)} doDelete={() => doDeleteUser(user, deleteUserFn)} />;
}

function renderLoading() {
  return (
    <View style={userStyles.centerFlex}>
      <Text>Loading...</Text>
    </View>
  );
}

function renderError() {
  return (
    <View style={userStyles.centerFlex}>
      <Text style={{color:'red'}}>{JSON.stringify(error, null, 5)}</Text>
    </View>
  );
}

function User() {
  const [renderFormObj, setRenderFormObj] = useState({ isRenderForm: false, initUser: {} });

  const {data, loading, refetch, error} = useQuery(listUsers, {fetchPolicy:'cache-and-network'});
  const [deleteUserFn] = useMutation(deleteUser);
  useSubscription(onCreateUser, { onSubscriptionData: data => handleUserOnData(data, refetch) });
  useSubscription(onUpdateUser, { onSubscriptionData: data => handleUserOnData(data, refetch) });
  useSubscription(onDeleteUser, { onSubscriptionData: data => handleUserOnData(data, refetch) });

  function closeForm() {
    setRenderFormObj({ isRenderForm: false, initUser: {} });
  }

  function openForm() {
    setRenderFormObj({ isRenderForm: true, initUser: {} });
  }

  if (renderFormObj.isRenderForm) return <UserForm closeForm={closeForm} initUser={renderFormObj.initUser} />;

  if (loading) return renderLoading();

  if (error) return renderError();
  
  const users = data ? data.listUsers : [];

  if (!users.length) return renderListEmpty();

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={[userStyles.header]}>
        <Text style={{fontSize:28, fontWeight:'bold'}}>{`${users.length} Users`}</Text>
        <TouchableOpacity onPress={openForm} style={[styles.center, userStyles.addUserBtn]}>
          <Text style={{color:'white'}}>Add User</Text>
        </TouchableOpacity>
      </View>
      <FlatList 
        data={users}
        renderItem={renderArg => renderUser(renderArg, setRenderFormObj, deleteUserFn)}
        keyExtractor={user => user.id}
        onRefresh={refetch}
        refreshing={loading}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{ paddingBottom:50 }}
      />
    </SafeAreaView>
  )
}
// #endregion USER

// #region USER_CARD
const CARD_MARGIN = 20;
const CARD_HEIGHT_PERCENTAGE = .5; // how big card is out of screen height

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
    flexDirection: 'row',
  }
});

function UserCard({
  user={},
  doUpdate=noop,
  doDelete=noop,
}) {
  const width = (getWidth() / NUM_COLUMNS) - (CARD_MARGIN * 2);
  const height = getHeight();

  return (
    <View style={[cardStyles.container]}>
      {/* Header */}
      <View style={[styles.center, { backgroundColor: 'rgba(0,0,0,.03)', height: height * CARD_HEIGHT_PERCENTAGE * 0.25 }]}>
        <Text style={cardStyles.header}>{`${user.name} - ${user.age === 0 ? 0 : user.age ? user.age : '∞'}`}</Text>
      </View>
      {/* Color Block */}
      <View style={[styles.center, {backgroundColor:user.favColor, height: height * CARD_HEIGHT_PERCENTAGE * 0.6}]}>
        <Text>{user.favColor}</Text>
      </View>
      {/* Action Btn Block */}
      <View style={[cardStyles.btnContainer]}>
        {/* Update Btn */}
        <TouchableOpacity onPress={doUpdate} style={[styles.center, { borderColor: COLORS.BLUE, borderRadius:4, borderWidth:1, width: (width / 2)-1, height: height * CARD_HEIGHT_PERCENTAGE * 0.15 }]}>
          <Text style={{ color:COLORS.BLUE }}>Update</Text>
        </TouchableOpacity>
        {/* Delete Btn */}
        <TouchableOpacity onPress={doDelete} style={[styles.center, { borderColor: COLORS.RED, borderRadius:4, borderWidth:1, width: (width / 2)-1, height: height * CARD_HEIGHT_PERCENTAGE * 0.15 }]}>
          <Text style={{ color:COLORS.RED }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
// #endregion USER_CARD

export default User;
