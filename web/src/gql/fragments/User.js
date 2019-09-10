import gql from 'graphql-tag';

export default gql`
  fragment user on User {
    id
    name
    age
    favColor
    createdAt
    updatedAt
  }
`;