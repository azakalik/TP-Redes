# To enable ssh & remote debugging on app service change the base image to the one below
# FROM mcr.microsoft.com/azure-functions/python:4-python3.10-appservice
FROM mcr.microsoft.com/azure-functions/python:4-python3.10

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

# 1. Install essential packages
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y \
        git \
        wget \
        curl  \
        unzip  \
        cmake   \
        unixodbc-dev \
        build-essential \
        libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev libasound2 \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Chrome and Chromedriver
RUN \
    curl -Lo "/tmp/chromedriver-linux64.zip" "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.105/linux64/chromedriver-linux64.zip" && \
    curl -Lo "/tmp/chrome-linux64.zip" "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.105/linux64/chrome-linux64.zip" && \
    unzip /tmp/chromedriver-linux64.zip -d /opt/ && \
    unzip /tmp/chrome-linux64.zip -d /opt/

# 3. Install python requirements
COPY requirements.txt /
RUN pip install -r /requirements.txt

# 4. Copy the code to the image
COPY . /home/site/wwwroot
