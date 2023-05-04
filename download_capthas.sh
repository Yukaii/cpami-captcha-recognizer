#!/bin/bash

# Create the images directory if it doesn't exist
mkdir -p ./images

# Set the URL of the captcha image source
url="http://cpabm.cpami.gov.tw/cers/img_code.jsp"

# Loop 500 times to download the images
for i in $(seq 1 500); do
    # Download the image and save it in the ./images directory
    wget -O "./images/captcha_$i.jpg" "$url"

    # Sleep for 300ms before the next download
    sleep 0.3
done
