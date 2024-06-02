import { AzureFunction, Context, HttpRequest } from "@azure/functions"

import { ApolloError, ApolloServer } from "apollo-server-azure-functions";
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


/*

"1791800272": {
    "title": "Audi S3 2.0 Tfsi Stronic Quattro 300cv",
    "url": "https://auto.mercadolibre.com.ar/MLA-1791800272-audi-s3-sedan-20tfsi-290cv-quattro-a5-a6-q2-q3-q5-q7-q8-rs-_JM#position=1&search_layout=grid&type=item&tracking_id=6468c516-5146-49fd-9ed5-7c9b12058cc0",
    "price": 112000,
    "km": 0,
    "year": 2024,
    "location": "San Isidro - Bs.As. G.B.A. Norte",
    "img_url": "https://http2.mlstatic.com/D_NQ_NP_900233-MLA76534981698_052024-W.webp",
    "car_brand": "audi"
  },
*/

/*
export interface Car {
    id: string;.
    make: string;.
    km: number;
    year: number;
    price: number;
    location: string;
    imageUrl: string;
    carBrand: string;
    url: string;
}
*/



const mapToModel = (id: string, entry: any) : Car => 
{

    const car: Car = {
        id,
        make : entry["title"],
        km: entry["km"],
        year: entry["year"],
        price: entry["price"],
        location: entry["location"],
        imageUrl: entry["img_url"],
        carBrand: entry["car_brand"],
        url: entry["url"],
        assignedToUserWithId: null
    }
 
    
    return car;
}


const cosmosScrapperInsertor: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const processSecret = process.env.SCRAPPER_SECRET

    if (req.headers["secret"] !== processSecret){

        context.res = { status: 401 }
        return;
    }
    
    const data = JSON.parse(req.body);

    const toInsertData = [];


    for (const key in data)
    {
        toInsertData.push(mapToModel(key, data[key]));
    }

    const carDataSource = buildCosmosDataSource<Car>("cars");
    carDataSource.initialize();

    await Promise.all(toInsertData.map(car => carDataSource.createOne(car)));
    
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: { msg: "Payload Recieved"}
    };

};

export default cosmosScrapperInsertor;

