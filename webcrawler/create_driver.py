from selenium import webdriver
from selenium.webdriver import Chrome
from selenium.webdriver.chrome.options import Options
from loguru import logger
from tempfile import mkdtemp
import sys


def create_driver() -> Chrome:
    try:
        chrome_options = Options()
        service = webdriver.ChromeService("/opt/chromedriver-linux64/chromedriver")
        chrome_options.binary_location = '/opt/chrome-linux64/chrome'

        # Run Chrome in headless (invisible) mode
        chrome_options.add_argument("--headless")

        # Disables the pop-up blocker.
        chrome_options.add_argument("--disable-popup-blocking")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--single-process")
        chrome_options.add_argument(f"--user-data-dir={mkdtemp()}")
        chrome_options.add_argument(f"--data-path={mkdtemp()}")
        chrome_options.add_argument(f"--disk-cache-dir={mkdtemp()}")

        driver = webdriver.Chrome(options=chrome_options, service=service)
        driver.maximize_window()
        driver.implicitly_wait(6)  # Global setting
    except Exception as exception:
        logger.exception("Fatal error while creating webcrawler driver. Do you have Chrome installed?")
        logger.debug(exception)
        sys.exit(1)

    return driver
