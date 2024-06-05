import { AzureFunction, Context } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { v4 as uuidv4 } from "uuid";

const cosmosDBTriggerFunction: AzureFunction = async function (context: Context, inputDocument: any[]): Promise<void> {
    context.log(`Triggered with ${inputDocument.length} changes.`);

    if (inputDocument.length > 0) {
        const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
        const database = cosmosClient.database(process.env.COSMOS_DATABASE_NAME);
        const carsContainer = database.container("cars");
        const maxPricesContainer = database.container("maxPrices");

        const { resources: cars } = await carsContainer.items.readAll().fetchAll();

        if (cars.length > 0) {
            const maxPriceCar = cars.reduce((prev, current) => (prev.price > current.price) ? prev : current);
            const maxPrice = maxPriceCar.price;
            const maxPriceId = maxPriceCar.id;

            await saveMaxPriceToCosmos(maxPrice, maxPriceId, maxPricesContainer);
            context.log(`Max price item inserted successfully with ID ${maxPriceId}`);
        } else {
            context.log("No cars found in the database.");
        }
    }
};

const saveMaxPriceToCosmos = async (maxPrice: number, maxPriceId: string, container: any) => {
    const uniqueId = uuidv4();
    const item = {
        id: uniqueId,
        max_price: maxPrice,
        max_price_id: maxPriceId,
        date: new Date().toISOString()
    };

    await container.items.create(item);
};

export default cosmosDBTriggerFunction;
