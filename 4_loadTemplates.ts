import * as path from "https://deno.land/std@0.57.0/path/mod.ts";
import jimp from "npm:jimp";

async function loadDigitTemplates(
  templateDir: string,
): Promise<Array<Array<number>>> {
  const digitTemplates: Array<Array<number>> = [];

  for (let i = 0; i < 10; i++) {
    const imagePath = path.join(templateDir, `${i}.jpg`);
    const digitImage = await jimp.read(imagePath);

    const digitArray: Array<number> = [];

    digitImage.scan(
      0,
      0,
      digitImage.bitmap.width,
      digitImage.bitmap.height,
      (x, y, idx) => {
        const red = digitImage.bitmap.data[idx + 0];
        const green = digitImage.bitmap.data[idx + 1];
        const blue = digitImage.bitmap.data[idx + 2];

        // Check if the pixel is black (all channels are 0)
        const isBlack = red === 0 && green === 0 && blue === 0;

        // Simplify the pixel representation: 1 for black, 0 for white
        digitArray.push(isBlack ? 1 : 0);
      },
    );

    digitTemplates.push(digitArray);
  }

  // write JSON file
  Deno.writeFileSync(
    path.join(templateDir, "./templates.json"),
    new TextEncoder().encode(JSON.stringify(digitTemplates)),
  );

  return digitTemplates;
}

const templates = await loadDigitTemplates("./templates");

console.log(JSON.stringify(templates));
