import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

// 离线处理：由真实透明轮廓识别人像，不按平均网格裁切。
const source = 'public/images/portrait-sprite.png';
const destination = 'public/images/portrait-frames';
const canvasSize = 324;
const targetWidth = 298;
const targetBottom = 310;
// 检查联系表后记录的颈部/胸口中心，源图像素；不是裁切框左上角。
const neckCenters = [
  175.3, 489.8, 810.8, 1139, 1447.3, 174.9, 492, 810.7, 1132, 1448, 194.3, 504.1, 812.7, 1125.2,
  1431.8,
];
const { data, info } = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height } = info;
const visited = new Uint8Array(width * height);
const queue = new Int32Array(width * height);
const subjects = [];
for (let start = 0; start < visited.length; start++) {
  if (visited[start] || data[start * 4 + 3] < 64) continue;
  let count = 1;
  let cursor = 0;
  let left = width;
  let top = height;
  let right = 0;
  let bottom = 0;
  queue[0] = start;
  visited[start] = 1;
  while (cursor < count) {
    const pixel = queue[cursor++];
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x);
    bottom = Math.max(bottom, y);
    const neighbors = [
      x > 0 ? pixel - 1 : -1,
      x < width - 1 ? pixel + 1 : -1,
      y > 0 ? pixel - width : -1,
      y < height - 1 ? pixel + width : -1,
    ];
    for (const neighbor of neighbors) {
      if (neighbor < 0 || visited[neighbor] || data[neighbor * 4 + 3] < 64) continue;
      visited[neighbor] = 1;
      queue[count++] = neighbor;
    }
  }
  if (count > 10000) subjects.push({ left, top, right, bottom, pixels: count });
}
if (subjects.length !== 15) throw new Error(`Expected 15 portraits, found ${subjects.length}`);
subjects.sort((a, b) => {
  const rowA = Math.floor((a.top + a.bottom) / 2 / (height / 3));
  const rowB = Math.floor((b.top + b.bottom) / 2 / (height / 3));
  return rowA - rowB || a.left - b.left;
});

await mkdir(destination, { recursive: true });
const calibration = [];
const contactSheet = [];
for (const [index, subject] of subjects.entries()) {
  const headCenters = [];
  for (let y = subject.top + 40; y <= subject.top + 190; y++) {
    let first = -1;
    let last = -1;
    for (let x = subject.left; x <= subject.right; x++) {
      if (data[(y * width + x) * 4 + 3] < 64) continue;
      if (first < 0) first = x;
      last = x;
    }
    if (first >= 0) headCenters.push((first + last) / 2);
  }
  headCenters.sort((a, b) => a - b);
  const headCenter = headCenters[Math.floor(headCenters.length / 2)];
  // 兼顾头部与身体中心，保留视角变化本身；不用眼睛横坐标抹去转头。
  const anchorX = headCenter * 0.35 + neckCenters[index] * 0.65;
  const scale = targetWidth / (subject.right - subject.left + 1);
  const crop = {
    left: Math.max(0, subject.left - 2),
    top: Math.max(0, subject.top - 2),
    width: subject.right - subject.left + 5,
    height: subject.bottom - subject.top + 5,
  };
  const outputWidth = Math.round(crop.width * scale);
  const outputHeight = Math.round(crop.height * scale);
  const left = Math.round(canvasSize / 2 - (anchorX - crop.left) * scale);
  const top = Math.round(targetBottom - (subject.bottom - crop.top) * scale);
  if (left < 0 || top < 0 || left + outputWidth > canvasSize || top + outputHeight > canvasSize) {
    throw new Error(`Frame ${index} would be clipped`);
  }
  const input = await sharp(source)
    .extract(crop)
    .resize(outputWidth, outputHeight, { fit: 'fill' })
    .png()
    .toBuffer();
  const filename = `portrait-${String(index).padStart(2, '0')}.png`;
  const output = await sharp({
    create: { width: canvasSize, height: canvasSize, channels: 4, background: '#00000000' },
  })
    .composite([{ input, left, top }])
    .png()
    .toBuffer();
  await writeFile(`${destination}/${filename}`, output);
  calibration.push({
    filename,
    subject,
    headCenter,
    neckCenter: neckCenters[index],
    anchorX,
    scale,
    crop,
    left,
    top,
  });
  contactSheet.push({
    input: output,
    left: (index % 5) * canvasSize,
    top: Math.floor(index / 5) * canvasSize,
  });
}
await writeFile(
  'scripts/portrait-frame-calibration.json',
  `${JSON.stringify(calibration, null, 2)}\n`,
);
await sharp({
  create: { width: canvasSize * 5, height: canvasSize * 3, channels: 4, background: '#f4f2ee' },
})
  .composite(contactSheet)
  .png()
  .toFile('/tmp/portrait-frames-contact.png');
console.log('Prepared 15 transparent 324 × 324 frames; calibration and contact sheet saved.');
