import { gql } from "apollo-server-azure-functions";


//    signIn(user: Int!): Int!
//    takeCar(id: String!): MutationResponse!



/*
    "id": "1429413831",
    "make": "Audi A3 2.0 Tfsi Sedan 190cv",
    "km": 96200,
    "year": 2018,
    "price": 27000000,
    "location": "Capital Federal - Capital Federal",
    "imageUrl": "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "carBrand": "audi",
    "url": "https://auto.mercadolibre.com.ar/MLA-1429413831-audi-a3-20-tfsi-sedan-s-tronic-permuta-cruze-focus-fr-_JM#position=12&search_layout=grid&type=item&tracking_id=42216203-b841-4acd-988e-33fb347236ca",
    "assignedToUserWithId": "sranucci1@example.com",

*/

export const typeDefs = gql`
  type Query {
    listFreeCars(limit: Int, offset: Int, token: String!): CarPage
    myData(token: String!): User
  }

  type Mutation {
    signUp(user: UserInp! ): MutationResponse!
    takeCar(id: String!, token: String!): MutationResponse!
    releaseCar(token: String!): MutationResponse!
  }

  type User {
    id: String
    name: String
    lastName: String
    age: Int
    car: Car # Return a Car object instead of ID
  }

  input SignInUserInp{
    email: String!
    password: String!
  }

  input UserInp {

    name: String!
    lastName: String!
    age: Int!
    email: String!
    password: String!

  }

  type Car {
    id: String
    make: String
    km: Int
    year: Int
    price: Float
    location: String
    carBrand: String
    user: User
  }

  type CarPage {
    items: [Car]
    itemsCount: Int
    status: Int
  }

  type MutationResponse {
    success: Boolean!
    message: String!
    status: Int!
  }

`;
