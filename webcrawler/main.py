from .create_driver import create_driver
from .scrape_ml import scrape_ml


def main():
    driver = create_driver()
    scrape_ml(driver, 'audi')


if __name__ == '__main__':
    main()
