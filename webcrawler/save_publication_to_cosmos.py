import azure.cosmos.documents as documents
import azure.cosmos.cosmos_client as cosmos_client
import azure.cosmos.exceptions as exceptions
from azure.cosmos.partition_key import PartitionKey
import datetime
import requests
import os

from publication_dto import PublicationDTO

def save_publication_to_cosmos(publication_dto: PublicationDTO):
    # Initialize the Cosmos client using the connection string
    client = cosmos_client.CosmosClient.from_connection_string(os.environ["CONNECTION_STRING"])
    # Create a dictionary representing the item to be inserted into Cosmos DB
    item = publication_dto.to_dict()

    # Insert the item into Cosmos DB
    try:
        client.get_database_client(os.environ["DATABASE_ID"]).get_container_client(os.environ["CONTAINER_ID"]).upsert_item(item)
        print("Item inserted successfully into Cosmos DB.")
    except exceptions.CosmosResourceExistsError:
        print("Item already exists in Cosmos DB.")
    except exceptions.CosmosHttpResponseError as e:
        print(f"Failed to insert item into Cosmos DB. Status code: {e.status_code}, Message: {e.message}")
