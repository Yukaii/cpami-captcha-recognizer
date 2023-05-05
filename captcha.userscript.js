// ==UserScript==
// @name         Captcha Recognizer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Recognize captcha on the page using template matching
// @author       You
// @match        http://cpabm.cpami.gov.tw/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Replace this array with the digitTemplates generated by your previous script
  const digitTemplates = [[0,0,1,1,1,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1,1,0,0,0],[0,1,1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,1,0],[0,0,1,1,1,1,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,1,1,1,1,1,0],[0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,0],[0,1,1,1,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,1,1,1,1,0,0],[0,0,1,1,1,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,1,1,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1,1,1,0,0],[0,1,1,1,1,1,1,1,0,1,0,0,0,0,1,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],[0,0,1,1,1,0,0,0,0,1,0,0,0,1,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,1,0,0,1,1,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0,0,1,1,1,1,0,0],[0,0,1,1,1,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0,1,1,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,1,1,0,0]];

  function imageToCanvas(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas;
  }

  function getGrayscaleImageData(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const grayscale = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
      data[i] = grayscale;
      data[i + 1] = grayscale;
      data[i + 2] = grayscale;
    }

    return imageData;
  }

  function thresholdImage(imageData, threshold = 128) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const value = data[i];
      const binaryValue = value > threshold ? 255 : 0;
      data[i] = binaryValue;
      data[i + 1] = binaryValue;
      data[i + 2] = binaryValue;
    }

    return imageData;
  }

  function mse(array1, array2) {
    if (array1.length !== array2.length) {
      throw new Error('Arrays must have the same length');
    }

    let error = 0;
    for (let i = 0; i < array1.length; i++) {
      error += (array1[i] - array2[i]) ** 2;
    }

    return error / array1.length;
  }

  function recognizeDigit(digitArray) {
    let minError = Number.MAX_VALUE;
    let recognizedDigit = -1;

    for (let i = 0; i < digitTemplates.length; i++) {
      const error = mse(digitArray, digitTemplates[i]);

      if (error < minError) {
        minError = error;
        recognizedDigit = i;
      }
    }

    return recognizedDigit;
  }

  function recognizeCaptcha() {
    const inputElement = document.querySelector('input[name="insrand"]');
    const img = inputElement.nextElementSibling;

    if (!img) {
        console.error('Captcha image not found');
        return;
    }

    const canvas = imageToCanvas(img);
    const imageData = getGrayscaleImageData(canvas);
    const thresholdedData = thresholdImage(imageData);

    const ctx = canvas.getContext('2d');
    ctx.putImageData(thresholdedData, 0, 0);

    const digitWidth = canvas.width / 4;
    const digitHeight = canvas.height;

    let captchaText = '';

    for (let i = 0; i < 4; i++) {
        const digitImageData = ctx.getImageData(i * digitWidth, 0, digitWidth, digitHeight);
        const digitArray = [];

        for (let j = 0; j < digitImageData.data.length; j += 4) {
            const value = digitImageData.data[j];
            digitArray.push(value === 0 ? 1 : 0);
        }

        // Convert the digitArray to a normalized array
        const normalizedDigitArray = [];
        for (let k = 0; k < digitArray.length / 3; k++) {
            normalizedDigitArray.push(digitArray[k * 3]);
        }

        const recognizedDigit = recognizeDigit(normalizedDigitArray);
        captchaText += recognizedDigit;
    }

    console.log(`Recognized captcha: ${captchaText}`);
  }

  // Wait for the image to load before recognizing the captcha
  window.addEventListener('load', () => {
    setTimeout(recognizeCaptcha, 1000);
  });
})();
