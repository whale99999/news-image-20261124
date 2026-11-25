// News-image entry for Tuesday 24 November 2026 (Node 22, standard library only).
// The image is the entry.png beside this file: a front page summing up the day's
// world news. This program checks it against the competition gate (whole PNG or
// JPEG, at most 1 MiB, at most 1024 by 1024 pixels) and copies it unchanged to
// the output directory, so two runs write identical bytes.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const source = new URL('./entry.png', import.meta.url);
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const bytes = readFileSync(source);

// The gate allows a whole PNG or JPEG, told apart by its first bytes.
const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
if (!isPng && !isJpeg) {
  throw new Error('entry.png is neither a PNG nor a JPEG (bad magic bytes)');
}

// Size cap: at most 1 MiB (1048576 bytes).
if (statSync(source).size > 1048576) {
  throw new Error('entry.png is larger than 1 MiB');
}

// Dimension cap: at most 1024 by 1024 pixels. For a PNG, width and height are
// the big-endian 32-bit fields at bytes 16-23 (the IHDR chunk).
if (isPng) {
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width > 1024 || height > 1024) {
    throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 cap`);
  }
}

copyFileSync(source, join(outDir, 'entry.png'));
