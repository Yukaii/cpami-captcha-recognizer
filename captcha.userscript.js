// ==UserScript==
// @name         Captcha Recognizer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Recognize captcha on the page using template matching
// @author       You
// @match        https://cpabm.cpami.gov.tw/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const digitTemplatesCompressed = [[0,0,1,1,1,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1,1,0,0,0],[0,1,1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,1,0],[0,0,1,1,1,1,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,1,1,1,1,1,0],[0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,0],[0,1,1,1,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,1,1,1,1,0,0],[0,0,1,1,1,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,1,1,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1,1,1,0,0],[0,1,1,1,1,1,1,1,0,1,0,0,0,0,1,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],[0,0,1,1,1,0,0,0,0,1,0,0,0,1,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,1,0,0,1,1,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0,0,1,1,1,1,0,0],[0,0,1,1,1,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0,1,1,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,1,1,0,0]];

  const digitTemplates = digitTemplatesCompressed.map((template) => {
    // from b/w to rbga
    const rawBits = []
    for (let i = 0; i < template.length; i++) {
      const bit = template[i];
      if (bit === 1) {
        rawBits.push(0, 0, 0, 255);
      } else {
        rawBits.push(255, 255, 255, 255);
      }
    }

    return rawBits;
  });

  function imageToCanvas(img) {
    const canvas = document.createElement('canvas');
    // Fixed size for the captcha image
    canvas.width = 60;
    canvas.height = 20;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas;
  }

  function mse(image, array2) {
    const { data, width, height } = image

    let sum = 0

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const diff = data[idx] - array2[idx];
        sum += diff * diff;
      }
    }

    return sum / (width * height);
  }

  function recognizeDigit(digitImage) {
    let minEMSE = Number.MAX_VALUE;
    let recognizedDigit = -1;

    for (let i = 0; i < digitTemplates.length; i++) {
      const error = mse(digitImage, digitTemplates[i]);

      if (error < minEMSE) {
        minEMSE = error;
        recognizedDigit = i;
      }
    }

    return recognizedDigit;
  }

  function processAndSplitDigits(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert to grayscale and apply threshold filter
    const threshold = 128;
    for (let i = 0; i < data.length; i += 4) {
      const grayscale = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
      const value = grayscale > threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = value;
    }
    ctx.putImageData(imageData, 0, 0);

    // Detect and extract individual digits
    const digitWidth = canvas.width / 4;
    const digitHeight = canvas.height;
    const digitImages = [];

    for (let i = 0; i < 4; i++) {
      const digitCanvas = document.createElement('canvas');
      const digitCtx = digitCanvas.getContext('2d');
      digitCanvas.width = digitWidth;
      digitCanvas.height = digitHeight;

      digitCtx.drawImage(canvas, i * digitWidth, 0, digitWidth, digitHeight, 0, 0, digitWidth, digitHeight);

      // Find edges by scanning rows and columns
      let left = digitWidth;
      let right = 0;
      let top = digitHeight;
      let bottom = 0;

      const digitImageData = digitCtx.getImageData(0, 0, digitWidth, digitHeight);
      const digitData = digitImageData.data;

      for (let y = 0; y < digitHeight; y++) {
        for (let x = 0; x < digitWidth; x++) {
          const idx = (y * digitWidth + x) * 4;
          const value = digitData[idx];
          if (value === 0) {
            left = Math.min(left, x);
            right = Math.max(right, x);
            top = Math.min(top, y);
            bottom = Math.max(bottom, y);
          }
        }
      }

      // Crop the digit based on the detected edges
      const croppedWidth = right - left + 1;
      const croppedHeight = bottom - top + 1;
      const croppedCanvas = document.createElement('canvas');
      const croppedCtx = croppedCanvas.getContext('2d');
      croppedCanvas.width = croppedWidth;
      croppedCanvas.height = croppedHeight;

      croppedCtx.drawImage(digitCanvas, left, top, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);

      // get image Data from cropped canvas
      const croppedImageData = croppedCtx.getImageData(0, 0, croppedWidth, croppedHeight);
      digitImages.push(croppedImageData);

      // Debug: draw the cropped image somewhere on the page
      document.body.appendChild(croppedCanvas);
      // set the position of the cropped canvas
      croppedCanvas.style.position = 'absolute';
      croppedCanvas.style.top = '0';
      croppedCanvas.style.left = `${i * 100}px`;
    }

    return digitImages;
  }

  function recognizeCaptcha() {
    const inputElement = document.querySelector('input[name="insrand"]');
    const img = inputElement.nextElementSibling;

    if (!img) {
        console.error('Captcha image not found');
        return;
    }

    const canvas = imageToCanvas(img);
    const digitImages = processAndSplitDigits(canvas);

    let captchaText = '';

    for (let i = 0; i < 4; i++) {
        const digitImage = digitImages[i];
        const recognizedDigit = recognizeDigit(digitImage);
        captchaText += recognizedDigit;
    }

    console.log(`Recognized captcha: ${captchaText}`);

    // auto-fill the captcha input
    inputElement.value = captchaText;
  }

  // Wait for the image to load before recognizing the captcha
  window.addEventListener('load', () => {
    setTimeout(recognizeCaptcha, 300);
  });
})();

