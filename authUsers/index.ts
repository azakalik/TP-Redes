import { AzureFunction, Context, HttpRequest } from "@azure/functions";

import { initializeApp, cert } from "firebase-admin/app";
import { DecodedIdToken, getAuth, } from "firebase-admin/auth";
import { typeDefs } from "./schema";
import { ApolloError, ApolloServer } from "apollo-server-azure-functions";
// Resolver map.
import { CosmosDataSource } from "apollo-datasource-cosmosdb";
import { CosmosClient } from "@azure/cosmos";
import { Car } from "../models/car";
import { User } from "../models/user";
import {
  user,
  car,
  listCars,
  listUsers,
  userResolver,
  carResolver,
} from "../commonFunctions/commonfunctions";

const serviceAccount = JSON.parse(process.env["FIREBASE_SECRET"]);

const app = initializeApp({
  credential: cert(serviceAccount),
});




const buildCosmosDataSource = <TData extends { id: string }>(
  containerId: string
) => {
  const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
  const container = client
    .database(process.env.COSMOS_DATABASE_NAME)
    .container(containerId);
  return new CosmosDataSource<TData, unknown>(container);
};

const resolvers = {
  //DONE
  Query: {
    listFreeCars: async (_, params, context) => {

      const limit = params.limit ?? 10;
      const offset = params.offset ?? 10;
      const token = params.token;

      const auth = getAuth(app);

      const carClient = context.dataSources.car as CosmosDataSource<Car, unknown>

      try {
        //exception if token is invalid
        await auth.verifyIdToken(token);

        //
        const { resources } = await carClient.findManyByQuery({
          query: "SELECT * FROM c WHERE c.assignedToUserWithId = null OFFSET @offset LIMIT @limit",
          parameters: [{ name: "@offset", value: offset }, { name: "@limit", value: limit }]
        })

        return { status: 200, items: resources, itemsCount: resources.length };
      }
      catch (err) {
        return { status: 401 };
      }

    },

    myData: async (_, params, context) => {
      const { token } = params;

      const auth = getAuth(app);

      let decoded: DecodedIdToken;

      try {
        decoded = await auth.verifyIdToken(token);
      } catch (err) {
        return { status: 401, success: false, message: "Unauthorized for this operation" };
      }

      const usersDbClient = context.dataSources.user as CosmosDataSource<User, unknown>

      const user: User = await usersDbClient.findOneById(decoded.email);

      return user;

    }
  },

  Mutation: {
    signUp: async (_, params, context) => {
      const { name, lastName, age, email, password } = params.user;

      const auth = getAuth(app);
      const userDbClient = context.dataSources.user as CosmosDataSource<User, unknown>
      try {
        const userRecord = await auth.createUser({ email, password })

        const newUser: User = { name, lastName, age, id: email, carId: null };

        try {
          await userDbClient.createOne(newUser);
        } catch (err) {
          await auth.deleteUser(userRecord.uid);
          return { success: false, message: "Error creating user", status: 500 }
        }

        return { success: true, message: "Successfully signed up", status: 201 };
        //store in database
      }
      catch (err) {
        return { success: false, message: err.errorInfo.message, status: 409 };
      }
    },


    takeCar: async (_, params, context) => {

      const { id, token } = params;

      const carsDbClient = context.dataSources.car as CosmosDataSource<Car, unknown>;
      const usersDbClient = context.dataSources.user as CosmosDataSource<User, unknown>;
      const auth = getAuth(app);
      let decoded: DecodedIdToken;
      try {
        decoded = await auth.verifyIdToken(token);
      } catch (err) {
        return { status: 401, success: false, message: "Unauthorized for this operation" };
      }

      try {
        const car: Car = await carsDbClient.findOneById(id);
        if (car.assignedToUserWithId === decoded.email) {
          return { success: true, message: "Car was already reserved for this user", status: 200 };
        }
        if (car.assignedToUserWithId !== null) {
          //esta a nombre de otro
          return { success: false, message: "Car already taken by another user", status: 409 };
        }

        const user: User = await usersDbClient.findOneById(decoded.email);
        if (user.carId !== null) {
          return { success: false, message: "User already has a car reserved", status: 409 };
        }

        user.carId = car.id;
        car.assignedToUserWithId = decoded.email;
        await carsDbClient.updateOne(car, car.location);
        await usersDbClient.updateOne(user, user.id);

        return { success: true, message: "Successfully reserved car", status: 200 };
      } catch (err) {
        return { success: false, message: "Unexpected error trying to reserve car", status: 500 }
      }

    },

    releaseCar: async (_, params, context) => {
      const {token} = params;
      const usersDbClient = context.dataSources.user as CosmosDataSource<User, unknown>;
      const carDbClient = context.dataSources.car as CosmosDataSource<Car,unknown>

      const auth = getAuth(app);
      
      let decoded : DecodedIdToken; 
      try
      {
        decoded = await auth.verifyIdToken(token);
      } 
      catch (err) 
      {
        return { status: 401, success: false, message: "Unauthorized for this operation" };
      }

      let user : User;
      let car: Car;
      try
      {
        user = await usersDbClient.findOneById(decoded.email);
        if (user.carId === null){
          return { status: 409, success: false, message: "This user doesnt have a car reserved"};
        }
        car = await carDbClient.findOneById(user.carId); 
      } catch (err)
      {
        return { status: 500, success: false, message: "Unexpected error"};
      }
 

      user.carId = null;
      car.assignedToUserWithId = null;

      try 
      {
        usersDbClient.updateOne(user,user.id);
        carDbClient.updateOne(car,car.location);
      }
      catch (err)
      {
        return { status: 500, success: false, message: "Unexpected error"};
      }

      return { status: 200, success: true, message: "Successfully Released car" };

    }
  },
  User: userResolver,
  Car: carResolver

};


// const handler: AzureFunction = async (
//   context: Context,
//   req: HttpRequest
// ): Promise<void> => {
//   const { email, password } = req.body;

//   const auth = getAuth(app);

//   try {
//     const result = await auth.createUser({ email, password });

//     return;
//   } catch (err) {}

//   return;
//};

// Create our server.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    car: buildCosmosDataSource<Car>("cars"),
    user: buildCosmosDataSource<User>("users"),
  }),
});


export default server.createHandler();
