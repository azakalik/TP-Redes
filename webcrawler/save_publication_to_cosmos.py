import azure.cosmos.documents as documents
import azure.cosmos.cosmos_client as cosmos_client
import azure.cosmos.exceptions as exceptions
from azure.cosmos.partition_key import PartitionKey
import datetime

import config
from publication_dto import PublicationDTO

HOST = config.settings['host']
MASTER_KEY = config.settings['master_key']
DATABASE_ID = config.settings['database_id']
CONTAINER_ID = config.settings['container_id']

def save_publication_to_cosmos(publication_dto: PublicationDTO):
    client = cosmos_client.CosmosClient(HOST, {'masterKey': MASTER_KEY}, user_agent="CosmosDBPythonQuickstart", user_agent_overwrite=True)
    # Create a dictionary representing the item to be inserted into Cosmos DB
    item = publication_dto.to_dict()

    # Insert the item into Cosmos DB
    try:
        client.get_database_client(DATABASE_ID).get_container_client(CONTAINER_ID).upsert_item(item)
        print("Item inserted successfully into Cosmos DB.")
    except exceptions.CosmosResourceExistsError:
        print("Item already exists in Cosmos DB.")
    except exceptions.CosmosHttpResponseError as e:
        print(f"Failed to insert item into Cosmos DB. Status code: {e.status_code}, Message: {e.message}")
