import { gql } from "apollo-server-azure-functions";

export const typeDefs = gql`

  type Mutation {
    createCar(car: CarInp!): Car!
    deleteCar(car: CarInp!): Car!
    createUser(user: User!): User!
    
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

  input CarInp {
    id: String
    make: String
    model: String
    miles: Int
  }

  type CarPage {
    items: [Car]
    itemsCount: Int
  }
`;
