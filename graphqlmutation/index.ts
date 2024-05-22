import { ApolloError, ApolloServer } from "apollo-server-azure-functions";
import { typeDefs } from "./schema";
// Resolver map.
import { CosmosDataSource } from "apollo-datasource-cosmosdb";
import { CosmosClient } from "@azure/cosmos";
import { Car } from "../models/car";
import { User } from "../models/user";
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
        user: async (_, params, context) => {
            return context.dataSources.user.findOneById(params.id);
        },
        car: async (_, params, context) => {
            return context.dataSources.car.findOneById(params.id);
        },

        listCars: async (_, params, context) => {
            const { limit = 10, offset = 0 } = params;
            const { resources } = await (
                context.dataSources.car as CosmosDataSource<Car, unknown>
            ).findManyByQuery({
                query: "SELECT * FROM c OFFSET @offset LIMIT @limit",
                parameters: [
                    { name: "@offset", value: offset },
                    { name: "@limit", value: limit },
                ],
            });
            return { items: resources, itemsCount: resources.length };
        },

        listUsers: async (_, params, context) => {
            const { limit = 10, offset = 0 } = params;
            const { resources } = await (
                context.dataSources.user as CosmosDataSource<User, unknown>
            ).findManyByQuery({
                query: "SELECT * FROM c OFFSET @offset LIMIT @limit",
                parameters: [
                    { name: "@offset", value: offset },
                    { name: "@limit", value: limit },
                ],
            });
            return { items: resources, itemsCount: resources.length };
        },
    },

    Mutation: {
        createCar: async (_, params, context) => {
            const car: Car = params.car;
            const { resource } = await (
                context.dataSources.car as CosmosDataSource<Car, unknown>
            ).createOne(car);
            return resource;
        },

        deleteCar: async (_, params, context) => {
            const carId = params.id;

            try {
                const resp = await (
                    context.dataSources.car as CosmosDataSource<Car, unknown>
                ).deleteOne(carId,carId);

                return { success : true, message: `Succesfully Deleted Car with Id ${carId}` , status: resp.statusCode};
            } catch (error) {
                return {success: false, message: `Deletion operation failed`, status: error.code}
            }
           
        },

        deleteUser: async (_, params, context) => {
            const userId = params.id;
            const { resource: deletedResource } = await (
                context.dataSources.user as CosmosDataSource<User, unknown>
            ).deleteOne(userId);
            return deletedResource;
        },

        createUser: async (_, params, context) => {
            const user: User = params.user;
            const carResource = await (
                context.dataSources.car as CosmosDataSource<Car, unknown>
            ).findOneById(user.carId);
            //manage error if resource doesnt exist
            if (!carResource) {
                throw new ApolloError(
                    "User has no car asociated",
                    "INTERNAL_SERVER_ERROR"
                );
            }

            const { resource: userResource } = await (
                context.dataSources.user as CosmosDataSource<User, unknown>
            ).createOne(user);
            return userResource;
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
