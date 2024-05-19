import { ApolloServer } from 'apollo-server-azure-functions';
import { typeDefs } from '../schema/schema';
// Resolver map.

import { CosmosDataSource } from 'apollo-datasource-cosmosdb';
import { CosmosClient } from '@azure/cosmos';
import { User } from '../models/user';
import { Car } from '../models/car';

const buildCosmosDataSource = <TData extends { id: string }>(
  containerId: string
) => {
  const client = new CosmosClient(
    process.env.COSMOS_CONNECTION_STRING
  );
  const container = client
    .database(process.env.COSMOS_DATABASE_NAME)
    .container(containerId);
    
  return new CosmosDataSource<TData, unknown>(container);
}

//Necesita resolver **IDENTICO** en nombre al Query definido en el schema
// Resolver map.
// Resolver map.
const resolvers = {
    Query: {
      user: async (_, params, context) => {
        return context.dataSources.user.findOneById(params.id);
      }
    },
    //Para la clase user, el Car resolvelo asi
    User: {
      car: async (parent, _, context) => {
        return context.dataSources.car.findOneById(parent.carId);
      }
    }
  };

// Create our server.
const server = new ApolloServer({ 
    typeDefs, 
    resolvers, 
    dataSources: () => ({
      user: buildCosmosDataSource<User>('users'),
      car: buildCosmosDataSource<Car>('cars')
    }) 
  });
export default server.createHandler();