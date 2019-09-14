import React, { useState, useReducer } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks';
import {
  Card,
  Button,
  ButtonGroup,
  Form,
  Alert,
} from 'react-bootstrap';

import { listUsers } from '../../gql/queries';
import { createUser, updateUser, deleteUser } from '../../gql/mutations';
import { onCreateUser, onUpdateUser, onDeleteUser } from '../../gql/subscriptions';

import './User.css';

function UserForm({ stateTuple, refetch, alertTuple }) {
  const [formState, setFormState] = stateTuple;
  const [alertObj, setAlertObj] = alertTuple;

  const [createUserFn] = useMutation(createUser);
  const [updateUserFn] = useMutation(updateUser);  
  
  const onFormChange = event => {
    setFormState({ ...formState, [event.target.name]:event.target.value });
  }

  const { isUpdate, showForm, name, age, color='#000000', user } = formState;

  const addUser = async event => {
    event.preventDefault();

    if (!name) {
      setAlertObj({ showAlert:true, msg:'Must provide name!', variant:'danger' });
      return;
    }

    try {      
      const res = await createUserFn({
        variables: {
          input: {
            name,
            favColor: color,
            age: Math.round(Number(age)),
          }
        }
      });
      await refetch();
      console.log('Create User Response:', res);
      setAlertObj({ showAlert: true, msg: `Successfully created user ${name}!`, variant: 'success' });
    } catch (err) {
      console.error(err);
      setAlertObj({ showAlert: true, msg: err.message || `Failed to create user ${name}`, variant: 'danger' });
    }
  }

  const doUpdateUser = async event => {
    event.preventDefault();

    try {
      const res = await updateUserFn({
        variables: {
          id: user.id,
          input:{
            name,
            favColor:color,
            age: Math.round(Number(age)),
          }
        }
      });
      console.log(res);
      setAlertObj({showAlert:true, msg:`Successfully updated user ${name}!`, variant:'success'});        
    } catch (err) {
      console.error(err);
      setAlertObj({showAlert:true, msg:err.message || `Failed to update user ${name}`, variant:'danger'});
    }
  }

  const stopUpdating = () => {
    setFormState({ ...formState, isUpdate:false, user:null, name:'', age:'', color:'#000000' })
  }

  const renderForm = () => {

    if (!showForm) return null;

    return (
      <Form style={{ backgroundColor:'white' }}>
        {/* Name Input */}
        <Form.Group controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" placeholder="Sgt. Slaughter" name="name" value={name} onChange={onFormChange} />
          <Form.Text className="text-muted">
            Enter a nickname if you wish.
          </Form.Text>
        </Form.Group>

        {/* Age Input */}
        <Form.Group controlId="age">
          <Form.Label>Age</Form.Label>
          <Form.Control type="number" step={1} placeholder="26" name="age" value={age ? Math.round(Number(age)) : ''} onChange={onFormChange} />
        </Form.Group>

        {/* Color Input */}
        <Form.Group controlId="color">
          <Form.Label>Color</Form.Label>
          <Form.Control type="color" name="color" value={color} onChange={onFormChange} />
          <Form.Text className="text-muted">
            {`Color is ${color}`}
          </Form.Text>
        </Form.Group>

        {/* Action Buttons */}
        <ButtonGroup>
          <Button variant="primary" type="submit" onClick={isUpdate ? doUpdateUser : addUser}>
            {isUpdate ? 'Update User' : 'Create User'}
          </Button>
          {isUpdate && (
            <Button variant="outline-danger" onClick={stopUpdating}>Stop Updating</Button>
          )}
        </ButtonGroup>
      </Form>
    )
  }

  return (
    <div>
      {/* Alert */}
      <Alert show={alertObj.showAlert} variant={alertObj.variant} dismissible onClose={() => setAlertObj({showAlert:false, msg:'',variant:''})}>
        <p>{alertObj.msg}</p>
      </Alert>
      {/* Form */}
      {renderForm()}
      {/* Action Buttons */}
      <ButtonGroup>
        <Button variant="warning" style={{margin:1}} onClick={() => setFormState({...formState, showForm:!showForm})}>
          {showForm ? 'Hide Form' : 'Show Form'}
        </Button>
        <Button variant="info" style={{margin:1}} onClick={() => refetch()}>
          Refetch
        </Button>
      </ButtonGroup>
    </div>
  )
}

const handleUserOnData = ({ client, subscriptionData:{data} }, refetch) => {  
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


function User() {
  const [alertObj, setAlertObj] = useState({ showAlert: false, msg: '', variant: '' });
  const [formState, setFormState] = useState({ showForm: true, isUpdate: false, user: null });

  const {data, loading, refetch} = useQuery(listUsers, { fetchPolicy:'cache-and-network' });
  
  const [deleteUserFn] = useMutation(deleteUser);

  useSubscription(onCreateUser, { onSubscriptionData: data => handleUserOnData(data, refetch) });
  useSubscription(onUpdateUser, { onSubscriptionData: data => handleUserOnData(data, refetch) });
  useSubscription(onDeleteUser, { onSubscriptionData: data => handleUserOnData(data, refetch) });
  
  const onClickUpdate = user => {
    setFormState({ ...formState, isUpdate: true, user, name: user.name, age: user.age, color: user.favColor });
  }

  const onClickDelete = async user => {
    try {
      const res = await deleteUserFn({
        variables: { id: user.id },
      });
  
      await refetch();
      console.log(res);
      setAlertObj({ showAlert:true, msg: `Successfully deleted user ${user.name}`, variant: 'success' });
    } catch (err) {
      console.error(err);
      setAlertObj({ showAlert: true, msg: `Failed to delete user ${user.name}`, variant:'danger' });
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p style={{color:'white'}}>Loading...</p>
      </div>
    );
  } 

  return (
    <div className="my-container">
      {/* User Form */}
      <UserForm stateTuple={[formState, setFormState]} alertTuple={[alertObj, setAlertObj]} refetch={refetch} />
      {/* Mapping of User Cards */}
      <div className="my-flex">
        {data.listUsers.map(user => {
          return (
            <Card key={user.id} bg="light" border="secondary" style={{width: '250px', margin:'20px'}}>
              <Card.Header>
                <h4>{`${user.name} - ${user.age || '∞'}`}</h4>
              </Card.Header>
              <div className="color-container" style={{backgroundColor:user.favColor}}>
                <span>{user.favColor}</span>
              </div>
              <ButtonGroup>
                <Button variant="outline-primary" onClick={() => onClickUpdate(user)}>Update</Button>
                <Button variant="outline-danger" onClick={() => onClickDelete(user)}>Delete</Button>
              </ButtonGroup>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default User;