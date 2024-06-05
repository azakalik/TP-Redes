import azure.cosmos.documents as documents
import azure.cosmos.cosmos_client as cosmos_client
import azure.cosmos.exceptions as exceptions
from azure.cosmos.partition_key import PartitionKey
import datetime
import requests

from publication_dto import PublicationDTO

def save_publication_to_cosmos(publication_dto):
    # Create a dictionary representing the item to be inserted into Cosmos DB
    azure_function_url = "http://localhost:7071/api/scrapperHandler"


    headers = {
        'secret': 'SCRAPPERSECRET',
        'Content-Type': 'application/json'  # Ensure the content type is set to application/json
    }

    try:

        response = requests.post(azure_function_url, json=publication_dto,headers= headers)

        response.raise_for_status()
        print("Item inserted successfully via Azure Function.")
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except Exception as err:
        print(f"An error occurred: {err}")
