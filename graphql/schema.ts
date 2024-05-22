import { gql } from "apollo-server-azure-functions";

export const typeDefs = gql`
  type Query {
    user(id: String!): User
    car(id: String!): Car
    listCars(limit: Int, offset: Int): CarPage
    listUsers(limit: Int, offset: Int): UsersPage
  }


  type User {
    id: String
    firstName: String
    lastName: String
    age: Int
    car: Car # Return a Car object instead of ID
  }

  type Car {
    id: String
    make: String
    model: String
    miles: Int
  }


  type CarPage {
    items: [Car]
    itemsCount: Int
  }

  type UsersPage {
    items: [User]
    itemsCount: Int
  }
`;
