import jimp from 'npm:jimp';

export async function processAndSplitDigits(imagePath: string): Promise<string[]> {
  const captcha = await jimp.read(imagePath);
  const tempFilePaths: string[] = [];

  // Convert the image to grayscale
  captcha.scan(0, 0, captcha.bitmap.width, captcha.bitmap.height, (x, y, idx) => {
    const red = captcha.bitmap.data[idx + 0];
    const green = captcha.bitmap.data[idx + 1];
    const blue = captcha.bitmap.data[idx + 2];

    const grayscale = (0.3 * red) + (0.59 * green) + (0.11 * blue);

    captcha.bitmap.data[idx + 0] = grayscale;
    captcha.bitmap.data[idx + 1] = grayscale;
    captcha.bitmap.data[idx + 2] = grayscale;

    if (x === captcha.bitmap.width - 1 && y === captcha.bitmap.height - 1) {
      // Grayscale conversion is finished, apply a threshold filter
      const threshold = 128;
      captcha.scan(0, 0, captcha.bitmap.width, captcha.bitmap.height, (x, y, idx) => {
        const value = captcha.bitmap.data[idx];
        captcha.bitmap.data[idx] = value > threshold ? 255 : 0;
        captcha.bitmap.data[idx + 1] = value > threshold ? 255 : 0;
        captcha.bitmap.data[idx + 2] = value > threshold ? 255 : 0;
      });

      // Detect and extract individual digits
      // Assuming each digit has a fixed width, and they are evenly spaced
      const digitWidth = captcha.bitmap.width / 4;
      const digitHeight = captcha.bitmap.height;

      (async () => {
        for (let i = 0; i < 4; i++) {
          let digit = captcha.clone().crop(i * digitWidth, 0, digitWidth, digitHeight);

          // Find edges by scanning rows and columns
          let left = digit.bitmap.width;
          let right = 0;
          let top = digit.bitmap.height;
          let bottom = 0;

          digit.scan(0, 0, digit.bitmap.width, digit.bitmap.height, (x, y, idx) => {
            const value = digit.bitmap.data[idx];
            if (value === 0) {
              left = Math.min(left, x);
              right = Math.max(right, x);
              top = Math.min(top, y);
              bottom = Math.max(bottom, y);
            }
          });

          // Crop the digit based on the detected edges
          digit.crop(left, top, right - left + 1, bottom - top + 1);

          const tempFilePath = await Deno.makeTempFile({
            prefix: `digit_${i + 1}_`,
            suffix: ".jpg",
          });

          await digit.writeAsync(tempFilePath);

          tempFilePaths.push(tempFilePath);

          if (tempFilePaths.length === 4) {
            return tempFilePaths;
          }
        }
      })();
    }
  });

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (tempFilePaths.length === 4) {
        clearInterval(interval);
        resolve(tempFilePaths);
      }
    }, 100);
  });
}
