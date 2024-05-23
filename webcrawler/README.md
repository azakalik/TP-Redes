# Azure Function with custom Docker container
## Build the image
Execute the following code
```bash
docker build --tag therealspackjarrow/azurefunctionsimage:v1.0.0 .
```

## Run the image locally
Execute the following code
```bash
docker run -p 8080:80 -it <DOCKER_ID>/azurefunctionsimage:v1.0.0
```
You can then access the following endpoint: `http://localhost:8080/api/scrape_ml`
Remember to add at the end a `car_brand`.
For example: `http://localhost:8080/api/scrape_ml?car_brand=ford`
