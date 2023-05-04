import * as path from "https://deno.land/std@0.57.0/path/mod.ts";
import jimp from 'npm:jimp';

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

async function processAndSplitDigits(imagePath: string) {
  const captcha = await jimp.read(imagePath);

  // Convert the image to grayscale
  captcha.grayscale();

  // Apply a threshold filter
  const threshold = 128;
  captcha.scan(0, 0, captcha.bitmap.width, captcha.bitmap.height, (x, y, idx) => {
    const value = captcha.bitmap.data[idx];
    captcha.bitmap.data[idx] = value > threshold ? 255 : 0;
  });

  // Save the thresholded image for debugging purposes
  await captcha.writeAsync(path.join(__dirname, `./processed/thresholded_${path.basename(imagePath)}`));

  // Detect and extract individual digits
  // Assuming each digit has a fixed width, and they are evenly spaced
  const digitWidth = captcha.bitmap.width / 4;
  const digitHeight = captcha.bitmap.height;

  for (let i = 0; i < 4; i++) {
    const digit = captcha.clone().crop(i * digitWidth, 0, digitWidth, digitHeight);
    await digit.writeAsync(path.join(__dirname, `./processed/thresholded_${path.basename(imagePath, '.jpg')}_${i + 1}.jpg`));
  }
}

// Process 100 images and split them into separate digit images
for (let i = 1; i <= 100; i++) {
  const imagePath = path.join(__dirname, `./images/captcha_${i}.jpg`);
  await processAndSplitDigits(imagePath);
}
