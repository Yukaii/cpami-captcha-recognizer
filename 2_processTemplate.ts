import * as path from "https://deno.land/std@0.57.0/path/mod.ts";
import jimp from 'npm:jimp';

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));


async function createDigitTemplate(digit: number) {
  const digitImage = await jimp.read(path.join(__dirname, `./original_templates/${digit}.jpg`));

  // Convert the image to grayscale
  digitImage.scan(0, 0, digitImage.bitmap.width, digitImage.bitmap.height, (x, y, idx) => {
    const red = digitImage.bitmap.data[idx + 0];
    const green = digitImage.bitmap.data[idx + 1];
    const blue = digitImage.bitmap.data[idx + 2];

    const grayscale = (0.3 * red) + (0.59 * green) + (0.11 * blue);

    digitImage.bitmap.data[idx + 0] = grayscale;
    digitImage.bitmap.data[idx + 1] = grayscale;
    digitImage.bitmap.data[idx + 2] = grayscale;

    if (x === digitImage.bitmap.width - 1 && y === digitImage.bitmap.height - 1) {
      // Grayscale conversion is finished, apply a threshold filter
      const threshold = 128;
      digitImage.scan(0, 0, digitImage.bitmap.width, digitImage.bitmap.height, (x, y, idx) => {
        const value = digitImage.bitmap.data[idx];
        digitImage.bitmap.data[idx] = value > threshold ? 255 : 0;
        digitImage.bitmap.data[idx + 1] = value > threshold ? 255 : 0;
        digitImage.bitmap.data[idx + 2] = value > threshold ? 255 : 0;
      });

      // Save the thresholded digit template
      digitImage.writeAsync(path.join(__dirname, `./templates/${digit}.jpg`));
    }
  });
}

// Create templates for each digit (0-9)
for (let i = 0; i <= 9; i++) {
  await createDigitTemplate(i);
}
