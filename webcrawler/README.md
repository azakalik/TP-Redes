# Azure Function with custom Docker container
## Build the image
Execute the following code
```bash
docker build --tag therealspackjarrow/azurefunctionsimage:v1.0.0 .
```

## Run the image locally
Execute the following code
```bash
docker run -p 8080:80 -it therealspackjarrow/azurefunctionsimage:v1.0.0
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
az group create --name US3AzureFunctionsContainers-rg --location centralus
az containerapp env create --name US3MyContainerappEnvironment --enable-workload-profiles --resource-group US3AzureFunctionsContainers-rg --location centralus
az storage account create --name us3storage --location centralus --resource-group US3AzureFunctionsContainers-rg --sku Standard_LRS
```
This verifies that everything executed correctly
```bash
az containerapp env show -n US3MyContainerappEnvironment -g US3AzureFunctionsContainers-rg
```

### Create the function app
```bash
az functionapp create --name us3azureseleniumfunction --storage-account us3storage --environment US3MyContainerappEnvironment --workload-profile-name "Consumption" --resource-group US3AzureFunctionsContainers-rg --functions-version 4 --runtime python --image therealspackjarrow/azurefunctionsimage:v1.0.0
az functionapp function show --resource-group US3AzureFunctionsContainers-rg --name us3azureseleniumfunction --function-name HttpExample --query invokeUrlTemplate
```

### Credits
More information about the steps above in the following hyperlink:
https://learn.microsoft.com/en-us/azure/azure-functions/functions-deploy-container-apps?tabs=docker%2Cbash&pivots=programming-language-python
