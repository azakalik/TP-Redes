import os
from dotenv import load_dotenv
load_dotenv()

settings = {
    'host': os.environ.get('ACCOUNT_HOST', 'https://spackjarrowcosmos.documents.azure.com:443/'),
    'master_key': os.environ.get('ACCOUNT_KEY', 'vwv6Qn8ONegSNIRb8G6liuIf1ZLppPEZmVk2FpmlKvxCKebPGIJiViME8PoHycBEQQbnCSE9Qd6xACDbumVN2A=='),
    'database_id': os.environ.get('COSMOS_DATABASE', 'redesDB'),
    'container_id': os.environ.get('COSMOS_CONTAINER', 'cars'),
}