import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const blobTriggerFunction: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {

  if (!req.body || !req.body.id || !req.body.firstName || !req.body.lastName || !req.body.age || !req.body.carId) {
    context.res = {
      status: 400,
      body: "Please pass id, firstName, lastName, age, and carId in the request body"
    };
    return;
  }

  const { id, firstName, lastName, age, carId } = req.body;

  context.log(`Received request with id: ${id}, firstName: ${firstName}, lastName: ${lastName}, age: ${age}, carId: ${carId}`);

  // Modifica los campos firstName y lastName a mayúsculas
  const modifiedFirstName = firstName.toUpperCase();
  const modifiedLastName = lastName.toUpperCase();

  context.log(`Modified firstName: ${modifiedFirstName}, modified lastName: ${modifiedLastName}`);

  try {
    const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
    const database = client.database(process.env.COSMOS_DATABASE_NAME);
    const container = database.container(process.env.COSMOS_CONTAINER_NAME);

    const document = {
      id,
      firstName: modifiedFirstName,
      lastName: modifiedLastName,
      age,
      carId,
      uploadDate: new Date().toISOString()
    };

    const { resource } = await container.items.create(document);

    context.log(`Document created with id: ${resource.id}`);

    context.res = {
      status: 200,
      body: `Processed and uploaded modified user to CosmosDB with id: ${id}`
    };
  } catch (error) {
    context.log.error('Error saving document to CosmosDB:', error.message);

    context.res = {
      status: 500,
      body: `Error processing request: ${error.message}`
    };
  }
};

export default blobTriggerFunction;
