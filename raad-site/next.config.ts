import path from 'node:path';
import type { NextConfig } from 'next';
import { deviceSizes, imageSizes } from './image-widths.mjs';

const nextConfig: NextConfig = {
  // Static HTML export: `npm run build` writes the whole site to ./out
  output: 'export',
  trailingSlash: true,
  images: {
    // No image server in a static export. `npm run build` first creates WebP copies of
    // every photo in public/images (scripts/images.mjs) and this loader picks the right size.
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    deviceSizes,
    imageSizes,
  },
  turbopack: { root: path.join(__dirname) },
  poweredByHeader: false,
};

export default nextConfig;
