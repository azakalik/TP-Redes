import azure.cosmos.documents as documents
import azure.cosmos.cosmos_client as cosmos_client
import azure.cosmos.exceptions as exceptions
from azure.cosmos.partition_key import PartitionKey
import datetime
import requests

from publication_dto import PublicationDTO

def save_publication_to_cosmos(publication_dto: PublicationDTO):
    # Create a dictionary representing the item to be inserted into Cosmos DB
    item = publication_dto.to_dict()
    azure_function_url = "https://g4vrb5h9-7071.brs.devtunnels.ms/scrapperHandler"
    try:
        response = requests.post(azure_function_url, json=item)

        response.raise_for_status()
        print("Item inserted successfully via Azure Function.")
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except Exception as err:
        print(f"An error occurred: {err}")
