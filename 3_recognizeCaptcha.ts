import * as path from "https://deno.land/std@0.57.0/path/mod.ts";
import jimp from 'npm:jimp';

import { processAndSplitDigits } from './utils.ts';

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

async function loadTemplates(): Promise<jimp[]> {
  const templates: jimp[] = [];

  for (let i = 0; i <= 9; i++) {
    const template = await jimp.read(path.join(__dirname, `./templates/${i}.jpg`));
    templates.push(template);
  }

  return templates;
}

function calculateMSE(image1: jimp, image2: jimp): number {
  let mse = 0;
  const width = image1.bitmap.width;
  const height = image1.bitmap.height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const diff = image1.bitmap.data[idx] - image2.bitmap.data[idx];
      mse += diff * diff;
    }
  }

  return mse / (width * height);
}

async function recognizeCaptcha(imagePath: string, templates: jimp[]): Promise<string> {
  const digits = await processAndSplitDigits(imagePath);

  let recognizedDigits = '';

  for (let i = 0; i < 4; i++) {
    const digitImage = await jimp.read(digits[i]);

    let minMSE = Infinity;
    let bestMatch = -1;

    for (let t = 0; t < templates.length; t++) {
      const template = templates[t];
      const mse = calculateMSE(digitImage, template);

      if (mse < minMSE) {
        minMSE = mse;
        bestMatch = t;
      }
    }

    recognizedDigits += bestMatch;
  }

  return recognizedDigits;
}


const templates = await loadTemplates();
const imagePath = path.join(__dirname, './images/captcha_1.jpg');
const recognizedCaptcha = await recognizeCaptcha(imagePath, templates);

console.log(`Recognized captcha: ${recognizedCaptcha}`);
