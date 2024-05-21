from .create_driver import create_driver
from .scrape_ml import scrape_ml


def main(car_brand:str = 'audi'):
    driver = create_driver()
    scrape_ml(driver, car_brand)


if __name__ == '__main__':
    main()
