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

function UserForm({ stateTuple, setIsRenderForm }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [color, setColor] = useState(INITIAL_COLOR);
  // const [formState, setFormState] = stateTuple;

  const [createUserFn] = useMutation(createUser);
  const [updateUserFn] = useMutation(updateUser);  

  const onColorChangeComplete = color => setColor(colorsys.hsv2Hex(color.h, color.s, color.v));

  const doCreateUser = async () => {
    if (!name) {
      alert('Must input name!')
      return;
    }  

    try {
      const {data} = await createUserFn({
        variables: {
          input: {
            name: name.trim(),
            age: parseInt(age),
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

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity activeOpacity={1} onPress={Keyboard.dismiss} style={styles.container}>
        <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
          <TouchableOpacity style={{margin:20}} onPress={() => setIsRenderForm(false)}>
            <Text style={{color:COLORS.BLUE}}>Go Back</Text>
          </TouchableOpacity>
          <View style={userFormStyles.formContainer}>
            <Text>Name <Text style={{color:'red'}}>*</Text></Text>
            <TextInput value={name} style={userFormStyles.textInput} placeholder="Sgt. Slaughter *" onChangeText={text => setName(text)} />
          </View>
          <View style={userFormStyles.formContainer}>
            <Text>Age</Text>
            <TextInput value={age} keyboardType="number-pad" style={userFormStyles.textInput} placeholder="26" onChangeText={text => setAge(text)} />
          </View>
          <Text>{color}</Text>
          <View style={userFormStyles.colorwheelContainer}>
            <ColorWheel
              initialColor={INITIAL_COLOR}
              onColorChange={color => console.log({color})}
              onColorChangeComplete={onColorChangeComplete}
              // style={userFormStyles.colorwheelContainer}
              thumbStyle={userFormStyles.colorwheelThumb}
            />
          </View>
          <TouchableOpacity style={userFormStyles.submitBtn} onPress={doCreateUser}>
            <Text style={{color:'white'}}>Create User</Text>
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

function renderUser({ item: user }) {
  return <UserCard user={user} />;
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
  const [isRenderForm, setIsRenderForm] = useState(false);

  const {data, loading, refetch, error} = useQuery(listUsers, {fetchPolicy:'cache-and-network'});
  useSubscription(onCreateUser, { onSubscriptionData: data => handleUserOnData(data, refetch) });
  useSubscription(onUpdateUser, { onSubscriptionData: data => handleUserOnData(data, refetch) });
  useSubscription(onDeleteUser, { onSubscriptionData: data => handleUserOnData(data, refetch) });

  if (isRenderForm) return <UserForm setIsRenderForm={setIsRenderForm} />;

  if (loading) return renderLoading();

  if (error) return renderError();
  
  const users = data ? data.listUsers : [];

  if (!users.length) return renderListEmpty();

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={[userStyles.header]}>
        <Text style={{fontSize:28, fontWeight:'bold'}}>{`${users.length} Users`}</Text>
        <TouchableOpacity onPress={() => setIsRenderForm(true)} style={[styles.center, userStyles.addUserBtn]}>
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
          <Text style={{ color:COLORS.BLUE }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.center, { borderColor: COLORS.RED, borderRadius:4, borderWidth:1, width: (width / 2)-1, height: height * CARD_HEIGHT_PERCENTAGE * 0.15 }]}>
          <Text style={{ color:COLORS.RED }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
// #endregion USER_CARD

export default User;
