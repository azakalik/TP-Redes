import { ApolloServer } from "apollo-server-azure-functions";
import { typeDefs } from "./schema";
// Resolver map.

import { CosmosDataSource } from "apollo-datasource-cosmosdb";
import { CosmosClient } from "@azure/cosmos";
import { User } from "../models/user";
import { Car } from "../models/car";
import { user , car, listCars, listUsers, userResolver, carResolver} from "../commonFunctions/commonfunctions";

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
  //Para la clase user, el Car resolvelo asi
  User: userResolver,
  Car: carResolver


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
