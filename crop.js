const sharp = require('sharp');
const fs = require('fs');

async function run() {
  const imgPath = '/home/ank/.gemini/antigravity/brain/6c480fad-258a-4694-aa81-65f91b065752/.user_uploaded/media_1791482882564.jpg';
  const metadata = await sharp(imgPath).metadata();
  const w = 341;
  const h = 227;
  
  const names = ['0-0', '0-1', '0-2', '1-0', '1-1', '1-2', '2-0', '2-1', '2-2'];
  let idx = 0;
  
  if (!fs.existsSync('public/assets')) {
    fs.mkdirSync('public/assets', { recursive: true });
  }

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      let left = c * w;
      let top = r * h;
      // adjust for last column/row to ensure we don't go out of bounds
      let cw = w;
      let ch = h;
      if (left + cw > metadata.width) cw = metadata.width - left;
      if (top + ch > metadata.height) ch = metadata.height - top;
      
      await sharp(imgPath)
        .extract({ left, top, width: cw, height: ch })
        .toFile(`public/assets/equip-${r}-${c}.jpg`);
    }
  }
  console.log("Done cropping");
}
run();
