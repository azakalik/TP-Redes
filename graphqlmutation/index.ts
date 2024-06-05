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

        deleteCar: async (_, params, context) => {
            const carId = params.id;

            const car = await (context.dataSources.car as CosmosDataSource<Car, unknown>).findOneById(carId);

            if (!car){
                return {success: false, message: "There is no car with the given id", status: 404}
            }

            const { resources: usersArray} = await (context.dataSources.user as CosmosDataSource<User,unknown>)
            .findManyByQuery({ query: "SELECT * FROM c WHERE c.carId = @carId", parameters : [{name: "@carId", value: carId}] });
            
            if (usersArray.length > 0)
                return {success: false, message: `Deletion operation failed because ${usersArray.length} a user has this car assigned`, status: 409};

            try {
                const resp = await (
                    context.dataSources.car as CosmosDataSource<Car, unknown>
                ).deleteOne(carId, carId);
                return { success: true, message: `Succesfully Deleted Car with Id ${carId}`, status: resp.statusCode };
            } catch (error) {
                return { success: false, message: `Deletion operation failed: code ${error.body.code}`, status: error.code }
            }
        },

        deleteUser: async (_, { id }, context) => {
            const userId = id;


            const userDataSource = context.dataSources.user as CosmosDataSource<User, unknown>
            const carDataSource = context.dataSources.car as CosmosDataSource<Car,unknown>

            try {
                //Modificar este nomas
                const currentUser = await userDataSource.findOneById(userId);
                if (!currentUser){
                    return { success: false, message: "User does not exist", status: 404};
                }
                if (currentUser.carId){
                    const currentCar = await carDataSource.findOneById(currentUser.carId);

                    currentCar.assignedToUserWithId = null;
    
                    
                    carDataSource.updateOne(currentCar,currentCar.location);

                }

                
                userDataSource.deleteOne(currentUser.id,currentUser.id);

                return {
                    success: true,
                    message: `Successfully deleted user with ID ${userId}`,
                    status: 200
                };
            } catch (error) {
                return {
                    success: false,
                    message: `Deletion operation failed for user with ID ${userId}, code: ${error.body.code}`,
                    status: error.code
                };
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
