import { ApolloServer } from "apollo-server-azure-functions";
import { typeDefs } from "./schema";
// Resolver map.

import { CosmosDataSource } from "apollo-datasource-cosmosdb";
import { CosmosClient } from "@azure/cosmos";
import { User } from "../models/user";
import { Car } from "../models/car";
import { user , car, listCars, listUsers} from "../commonFunctions/commonfunctions";

const buildCosmosDataSource = <TData extends { id: string }>(
  containerId: string
) => {
  const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
  const container = client
    .database(process.env.COSMOS_DATABASE_NAME)
    .container(containerId);

  return new CosmosDataSource<TData, unknown>(container);
};

//Necesita resolver **IDENTICO** en nombre al Query definido en el schema
// Resolver map.
// Resolver map.
const resolvers = {
  Query: {
    user,
    car,
    listCars,
    listUsers
  },

  Mutation: {
    createUser: async (_, params, context) => {
      const user: User = params.user;

      const existingUser = await (
        context.dataSources.user as CosmosDataSource<User, unknown>
      ).findOneById(user.id);
      //manage error if resource doesnt exist
      if (existingUser) {
        return { success: false, message: `User with id ${user.id} already exists`, status: 409 }
      }


      try {
        const response = await (
          context.dataSources.user as CosmosDataSource<User, unknown>
        ).createOne(user);
        return { success: true, message: `User with id ${user.id} created successfully`, status: response.statusCode };
      } catch (error) {
        return { success: false, message: `User with id ${user.id} could not be created. Code: ${error.body.code}`, status: error.code }
      }

    },

    takeCar: async (_,params,context) => {
      //TODO hacer cuando ande la auth!

      // const existingCar = await (
      //   context.dataSources.car as CosmosDataSource<Car, unknown>
      // ).findOneById(params.id);

      // if (!existingCar)
      //   return { success: false, message: `Car with id ${params.id} could not be found`, status: 404};

      // const {resources : carsAssignedToUsers} = await (context.dataSources.user as CosmosDataSource<User,unknown>) 
      // .findManyByQuery({ query: "SELECT * FROM c WHERE c.carId = @carId", parameters: [{name: "@carId", value: params.id}]});
      // if (carsAssignedToUsers.length > 0)
      //   return { success: false, message: `Car with id ${params.id} is taken by another user`, status: 409};

      // await (context.dataSources.user as CosmosDataSource<User,unknown>).updateOne(,)
      
    }
  },
  //Para la clase user, el Car resolvelo asi
  User: {
    car: async (parent, _, context) => {
      if (!parent.carId){
        return null;
      }
      return context.dataSources.car.findOneById(parent.carId);
    },
  },


};

// Create our server.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    user: buildCosmosDataSource<User>("users"),
    car: buildCosmosDataSource<Car>("cars"),
  }),
});
export default server.createHandler();
