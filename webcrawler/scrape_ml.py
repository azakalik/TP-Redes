from selenium.webdriver import Chrome
from selenium.webdriver.common.by import By
from selenium.common.exceptions import StaleElementReferenceException
from loguru import logger
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from publication_dto import PublicationDTO
import time


def scrape_ml(driver: Chrome, car_brand: str) -> list[PublicationDTO]:
    """Scrapes MercadoLibre for the prices of a car brand."""

    driver.get(f'https://listado.mercadolibre.com.ar/{car_brand}')
    publications = find_all_publication_cards(driver, car_brand)
    return publications


def find_all_publication_cards(driver: Chrome, car_brand: str) -> list[PublicationDTO]:
    """Finds all <li> tags on the current page."""
    wait = WebDriverWait(driver, 10)

    # Wait until at least one <li> element is present
    wait.until(EC.presence_of_element_located((By.TAG_NAME, 'li')))

    publications = []

    # Find all <li> elements with the specific class of the publication card
    li_elements = driver.find_elements(By.CSS_SELECTOR, 'li.ui-search-layout__item')

    idx = 0
    while idx < len(li_elements):
        try:
            li_tag = driver.find_elements(By.CSS_SELECTOR, 'li.ui-search-layout__item')[idx]
            url = li_tag.find_element(By.CSS_SELECTOR, 'a.ui-search-link__title-card').get_attribute('href')
            img_url = li_tag.find_element(By.CSS_SELECTOR, 'img').get_attribute('src')
            idx += 1
            text = li_tag.text
            items = text.split('\n')
            price = int(items[1].replace('.', ''))
            year = int(items[2])
            km = int(items[3].replace('.', '').replace(' Km', ''))
            title = items[4]
            location = items[5]
            publication = PublicationDTO(price=price, year=year, km=km, title=title, location=location, url=url, img_url=img_url, car_brand=car_brand)
            publications.append(publication)
        except Exception as e:
            idx -= 1

    return publications
