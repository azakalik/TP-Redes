import { ApolloError, ApolloServer } from "apollo-server-azure-functions";
import { typeDefs } from "./schema";
// Resolver map.
import { CosmosDataSource } from "apollo-datasource-cosmosdb";
import { CosmosClient } from "@azure/cosmos";
import { Car } from "../models/car";
import { User } from "../models/user";
import {user, car, listCars, listUsers} from "../commonFunctions/commonfunctions"



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
        createCar: async (_, params, context) => {
            const car: Car = params.car;
            car.assignedToUserWithId = null;

            try {
                const resp = await (
                    context.dataSources.car as CosmosDataSource<Car, unknown>
                ).createOne(car);
                return { success: true, message: `Succesfully created car with id ${car.id}`, status: resp.statusCode };
            } catch (error) {
                return { success: false, message: `Creation failed: code ${error.body.code}`, status: error.code };
            }
        },
       
    },
};

// Create our server.
const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        car: buildCosmosDataSource<Car>("cars"),
        user: buildCosmosDataSource<User>("users")
    }),
});
export default server.createHandler();
