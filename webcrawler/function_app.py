import azure.functions as func
import datetime
import json
import logging
import dataclasses
import json

from create_driver import create_driver
from scrape_ml import scrape_ml
from save_publication_to_cosmos import save_publication_to_cosmos

app = func.FunctionApp()

@app.route(route="scrape_ml", auth_level=func.AuthLevel.ANONYMOUS)
def HttpExample(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    car_brand = req.params.get('car_brand')
    if not car_brand:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            name = req_body.get('car_brand')

    if car_brand:
        driver = create_driver()
        scraped_cars = scrape_ml(driver, car_brand)
        results = {}
        for car in scraped_cars:
            id = car.get_publication_id()
            results[id] = dataclasses.asdict(car)
            save_publication_to_cosmos(car)

        return func.HttpResponse(json.dumps(results))
    else:
        return func.HttpResponse(
             "Please pass car_brand as a parameter.",
             status_code=400
        )