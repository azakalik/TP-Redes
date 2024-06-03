import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import axios from 'axios';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log('HTTP trigger function processed a request.');

  if (!req.body || !req.body.id || !req.body.title || !req.body.url || !req.body.price ||
      !req.body.km || !req.body.year || !req.body.location || !req.body.img_url || !req.body.car_brand) {
    context.res = {
      status: 400,
      body: "Please pass all required fields in the request body"
    };
    return;
  }

  const { id, title, url, price, km, year, location, img_url, car_brand } = req.body;

  context.log(`Received request with id: ${id}, title: ${title}, url: ${url}, price: ${price}, km: ${km}, year: ${year}, location: ${location}, img_url: ${img_url}, car_brand: ${car_brand}`);

  try {
    const maxRetries = 3;
    let attempts = 0;
    let imageData;

    while (attempts < maxRetries) {
      try {
        const response = await axios.get(img_url, { responseType: 'arraybuffer', timeout: 5000 });
        imageData = Buffer.from(response.data, 'binary');
        context.log(`Downloaded image from URL: ${img_url}`);
        break;
      } catch (error) {
        attempts++;
        context.log.error(`Attempt ${attempts} to download image failed: ${error.message}`);
        if (attempts >= maxRetries) {
          throw new Error(`Failed to download image after ${maxRetries} attempts`);
        }
      }
    }

    const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
    const database = client.database(process.env.COSMOS_DATABASE_NAME);
    const container = database.container(process.env.COSMOS_CONTAINER_NAME);

    context.log('Connected to CosmosDB');

    // Verificar si el documento ya existe
    const { resource: existingDocument } = await container.item(id, id).read();

    if (existingDocument) {
      // Documento existente - Actualizar
      existingDocument.title = title;
      existingDocument.url = url;
      existingDocument.price = price;
      existingDocument.km = km;
      existingDocument.year = year;
      existingDocument.location = location;
      existingDocument.img_url = img_url;
      existingDocument.car_brand = car_brand;
      existingDocument.image_data = imageData.toString('base64');
      existingDocument.uploadDate = new Date().toISOString();

      await container.items.upsert(existingDocument);
      context.log(`Document updated with id: ${existingDocument.id}`);
    } else {
      // Documento no existente - Crear
      const newDocument = {
        id,
        title,
        url,
        price,
        km,
        year,
        location,
        img_url,
        car_brand,
        image_data: imageData.toString('base64'),
        uploadDate: new Date().toISOString()
      };

      await container.items.create(newDocument);
      context.log(`Document created with id: ${id}`);
    }

    const querySpec = {
      query: "SELECT VALUE MAX(c.price) FROM c"
    };

    const { resources } = await container.items.query(querySpec).fetchAll();

    let maxPrice = 0;
    if (resources.length > 0) {
      maxPrice = resources[0];
      context.log(`Max price found: ${maxPrice}`);
    } else {
      context.log('No cars found in the database.');
    }

    context.res = {
      status: 200,
      body: `Processed and uploaded modified user to CosmosDB with id: ${id}. The maximum price is ${maxPrice}`
    };
  } catch (error) {
    context.log.error('Error processing request:', error.message);
    context.log.error('Error details:', error);

    context.res = {
      status: 500,
      body: `Error processing request: ${error.message}`
    };
  }
};

export default httpTrigger;
