# Azure Function with custom Docker container
## Build the image
Execute the following code
```bash
docker build --tag therealspackjarrow/azurefunctionsimage:v1.0.0 .
```

## Run the image locally
Execute the following code
```bash
sudo sudo docker run --rm -p 8080:80 -it   -e CONNECTION_STRING="<COSMOS_CONNECTION_STRING>" -e DATABASE_ID="<DB_ID>" -e CONTAINER_ID="<CONTAINER_ID>"   therealspackjarrow/azurefunctionsimage:v1.0.0
```
You can then access the following endpoint: `http://localhost:8080/api/scrape_ml`
Remember to add at the end a `car_brand`.
For example: `http://localhost:8080/api/scrape_ml?car_brand=ford`


## Deploy in Azure
### Install Azure-CLI
Follow the steps from the official webpage https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

### Push the image to Dockerhub
Execute the following code to publish the image in dockerhub.
Replace `therealspackjarrow` with your docker account name.
```bash
docker push therealspackjarrow/azurefunctionsimage:v1.0.0
```

### Create initial resources
The commands below create:
- A resource group, which is a logical container for related resources.
- A Storage account, which is used to maintain state and other information about your functions.
- An Azure Container Apps environment with a Log Analytics workspace.
```bash
az group create --name AzureFunctionsContainer --location eastus2
az containerapp env create --name AzureFunctionsContainerappEnvironment --enable-workload-profiles --resource-group AzureFunctionsContainer --location eastus2
az storage account create --name azureseleniumstorage --location eastus2 --resource-group AzureFunctionsContainer --sku Standard_LRS
```


### Create the function app
```bash
az functionapp create --name azureseleniumfunction --storage-account azureseleniumstorage --environment AzureFunctionsContainerappEnvironment --workload-profile-name "Consumption" --resource-group AzureFunctionsContainer --functions-version 4 --runtime python --image sranucci/azurefunctionsimage:v1.0.0


#reemplazar 
# your_connection_string=<String de conexion de azure>
# your_database_id="CarStore"
# your_container_id="cars"
az functionapp config appsettings set --name azureseleniumfunction --resource-group AzureFunctionsContainer --settings CONNECTION_STRING="your_connection_string" DATABASE_ID="your_database_id" CONTAINER_ID="your_container_id"


az functionapp function show --resource-group AzureFunctionsContainers-rg --name azureseleniumfunction --function-name HttpExample --query invokeUrlTemplate
```


```
>az group create --name AzureFunctionsContainers-rg --location eastus2

>

```

### Credits
More information about the steps above in the following hyperlink:
https://learn.microsoft.com/en-us/azure/azure-functions/functions-deploy-container-apps?tabs=docker%2Cbash&pivots=programming-language-python
