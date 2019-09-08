import React, { useState, useRef } from 'react';
import {useQuery, useMutation, useSubscription} from '@apollo/react-hooks';
import {
  Card,
  Button,
  ButtonGroup,
  Form,
} from 'react-bootstrap';

import {listUsers} from '../../gql/queries';
import {createUser, updateUser, deleteUser} from '../../gql/mutations';
import {onCreateUser, onUpdateUser, onDeleteUser} from '../../gql/subscriptions';

import './User.css';

function UserForm({stateTuple}) {
  const [createUserFn] = useMutation(createUser);
  const [formState, setFormState] = stateTuple;
  
  const onFormChange = event => {
    setFormState({...formState, [event.target.name]:event.target.value});
  }

  const {isEdit, showForm, name, age, color='black', user} = formState;

  const addUser = (event) => {
    event.preventDefault();

    alert(JSON.stringify({formState,type:'addUser'}, null, 5))
  }

  const editUser = (event) => {
    event.preventDefault();

    alert(JSON.stringify({user,type:'updateUser'}, null, 5))
  }

  const stopUpdating = () => {
    setFormState({...formState, isEdit:false, user:null, name:'', age:'', color:'black'})
  }

  const renderForm = () => {

    if (!showForm) return null;

    return (
      <Form style={{backgroundColor:'white'}}>
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
          <Form.Control type="number" placeholder="26" name="age" value={age} onChange={onFormChange} />
        </Form.Group>

        {/* Color Input */}
        <Form.Group controlId="color">
          <Form.Label>Color</Form.Label>
          <Form.Control type="color" name="color" defaultValue={color} value={color} onChange={onFormChange} />
          <Form.Text className="text-muted">
            {`Color is ${color}`}
          </Form.Text>
        </Form.Group>

        {/* Action Buttons */}
        <ButtonGroup>
          <Button variant="primary" type="submit" onClick={isEdit ? editUser : addUser}>
            {isEdit ? 'Update User' : 'Create User'}
          </Button>
          {isEdit && (
            <Button variant="outline-danger" onClick={stopUpdating}>Stop Updating</Button>
          )}
        </ButtonGroup>
      </Form>
    )
  }

  return (
    <div>
      {/* Form */}
      {renderForm()}
      {/* Action Buttons */}
      <ButtonGroup>
        <Button variant="warning" style={{marginTop:1}} onClick={() => setFormState({...formState, showForm:!showForm})}>
          {showForm ? 'Hide Form' : 'Show Form'}
        </Button>
      </ButtonGroup>
    </div>
  )
}


function User() {
  const {data, loading} = useQuery(listUsers);
  const [deleteUserFn] = useMutation(deleteUser);
  console.log(loading, data);

  const [formState, setFormState] = useState({showForm:true, isEdit:false, user:null});  
  
  const onClickEdit = (user) => {
    setFormState({...formState, isEdit:true, user, name:user.name, age:user.age, color:user.favColor});
  }

  const onClickDelete = user => {
    alert(JSON.stringify({user,type:'deleteUser'}, null, 5));
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
      {/* <p style={{color:'white'}}>{JSON.stringify({loading, data}, null, 5)}</p> */}
      <UserForm stateTuple={[formState, setFormState]} />
      <div className="my-flex">
        {data.listUsers.map(user => {
          return (
            <Card bg="light" border="secondary" style={{width: '10vw', margin:'20px'}}>
              <Card.Header><h4>{`${user.name} - ${user.age}`}</h4></Card.Header>
              <div className="color-container" style={{backgroundColor:user.favColor}}>
                <span>{user.favColor}</span>
              </div>
              <ButtonGroup>
                <Button variant="outline-primary" onClick={() => onClickEdit(user)}>Edit</Button>
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