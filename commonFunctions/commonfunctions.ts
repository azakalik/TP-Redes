import { CosmosDataSource } from "apollo-datasource-cosmosdb";
import { Car } from "../models/car";
import { User } from "../models/user";

export const user = async (_, params, context) => {
    return context.dataSources.user.findOneById(params.id);
};

export const car = async (_, params, context) => {
    return context.dataSources.car.findOneById(params.id);
}

export const listCars = async (_, params, context) => {
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
}

export const listUsers = async (_, params, context) => {


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
}

