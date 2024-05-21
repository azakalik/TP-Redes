# 0. Extend from the Azure Functions Python base image
FROM mcr.microsoft.com/azure-functions/python:4-python3.10

# 1. Install essential packages
RUN apt-get update \
    && apt-get install -y \
        git \
        wget \
        curl  \
        unzip  \
        cmake   \
        unixodbc-dev \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# 1. Install Chrome and Chromedriver
RUN \
    curl -Lo "/tmp/chromedriver-linux64.zip" "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.105/linux64/chromedriver-linux64.zip" && \
    curl -Lo "/tmp/chrome-linux64.zip" "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.105/linux64/chrome-linux64.zip" && \
    unzip /tmp/chromedriver-linux64.zip -d /opt/ && \
    unzip /tmp/chrome-linux64.zip -d /opt/

# 2. Install necessary dependencies to run Chrome and Chromedriver
RUN apt update && apt upgrade
RUN apt-get -y install libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev libasound2

# 3. Install Python dependencies
RUN pip install pipenv
RUN mkdir -p /home/site/wwwroot/webcrawler
COPY Pipfile /home/site/wwwroot/webcrawler
RUN cd /home/site/wwwroot/webcrawler && pipenv install

# 4. Finally, copy python code to image
COPY . /home/site/wwwroot/webcrawler

# 5. Set the working directory
WORKDIR /home/site/wwwroot/webcrawler

# 6. Command to run the main function
CMD ["pipenv", "run", "main"]
