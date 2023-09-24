import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { DEFAULT, type PicommitConfig } from './main'

const IMG_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp']

export function getImagesFromDocs(
  dir: string,
  { exclude = [] }: PicommitConfig,
): string[] {
  const files = fs.readdirSync(dir)

  let results: string[] = []

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      results = results.concat(getImagesFromDocs(fullPath, { exclude }))
    } else if (
      IMG_EXTENSIONS.includes(path.extname(file).toLowerCase()) &&
      !exclude.includes(fullPath)
    ) {
      results.push(fullPath)
    }
  }

  return results
}

export async function processImages(config: PicommitConfig): Promise<void> {
  const {
    docsDirectory = DEFAULT.docsDirectory,
    imageProcessingOptions = DEFAULT.imageProcessingOptions,
  } = config
  const images = getImagesFromDocs(docsDirectory, config)

  await Promise.all(
    images.map(async (imgPath) => {
      await handleImageProcessing(imgPath, imageProcessingOptions)
    }),
  ).catch((err) => {
    throw err
  })
}

async function handleImageProcessing(
  imgPath: string,
  opts: PicommitConfig['imageProcessingOptions'],
) {
  let image = sharp(imgPath)
  const ext = path.extname(imgPath)
  const baseName = path.basename(imgPath, ext)
  const outputPath = path.join(path.dirname(imgPath), baseName + ext)

  if (opts.width || opts.height) image = handleSize(image, opts)
  if (opts.quality) image = handleQuality(image, opts, imgPath)
  if (opts.radius) image = await handleRadius(image, opts)
  if (opts.shadow) image = await handleShadow(image, opts)

  await fs.promises.unlink(imgPath)
  await image.toFile(outputPath)
}

function handleSize(
  image: sharp.Sharp,
  opts: PicommitConfig['imageProcessingOptions'],
): sharp.Sharp {
  if (opts.width < 100 || opts.height < 100) return image
  const { width, height } = opts
  return image.resize(width, height)
}

/**
 * Applies quality settings to an image using Sharp library.
 *
 * @param image - The Sharp object representing the image to process.
 * @param opts - The image processing options to apply.
 * @param imgPath - The path to the image file being processed.
 * @returns A Sharp object with the quality settings applied.
 */
function handleQuality(
  image: sharp.Sharp,
  opts: PicommitConfig['imageProcessingOptions'],
  imgPath: string,
): sharp.Sharp {
  if (10 > opts.quality || opts.quality > 100) return image
  const quality = opts.quality || 100
  let extention = path.extname(imgPath).toLowerCase().substring(1)
  if (extention === 'jpg') extention = 'jpeg'
  return image[extention]({ quality })
}

async function handleRadius(
  image: sharp.Sharp,
  opts: PicommitConfig['imageProcessingOptions'],
): Promise<sharp.Sharp> {
  if (opts.radius < 0 || opts.radius > 100) return image
  const radius = opts.radius || 0
  const { width, height } = await image.metadata()

  const svg = Buffer.from(
    `<svg><rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}" /></svg>`,
  )

  return image
    .resize(width, height, { fit: 'cover' })
    .composite([{ input: svg, blend: 'dest-in' }])
}

/**
 * Applies a shadow effect to the given image using the provided options.
 * https://github.com/lovell/sharp/issues/1490
 *
 * @param image - The image to apply the shadow effect to.
 * @param opts - The options for the shadow effect.
 * @returns A Promise that resolves with the processed image.
 */
async function handleShadow(
  image: sharp.Sharp,
  opts: PicommitConfig['imageProcessingOptions'],
): Promise<sharp.Sharp> {
  const blur = opts.shadow.blur || 0
  const opacity = opts.shadow.opacity || 0
  const offsetX = opts.shadow.x || 0
  const offsetY = opts.shadow.y || 0

  const { width, height } = await image.metadata()

  const shadow = await sharp(
    Buffer.from(`
      <svg width="${width}" height="${height}">
        <defs>
          <radialGradient id="gradient" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
            <stop offset="0%" style="stop-color:rgba(0, 0, 0, 0)" />
            <stop offset="100%" style="stop-color:rgba(0, 0, 0, ${opacity})" />
          </radialGradient>
        </defs>
        <rect
        width="${width - 2 * offsetX}"
        height="${
          height - 2 * offsetX
        }" fill="url(#gradient)" x="${offsetX}" y="${offsetY}"/>
      </svg>`),
  )
    .blur(blur)
    .toBuffer()

  const image_ = await image
    .resize(width - 4 * offsetX, height - 4 * offsetY)
    .toBuffer()

  return sharp({
    create: {
      width: width + offsetX,
      height: height + offsetY,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  }).composite([
    { input: shadow, blend: 'multiply' },
    { input: image_, blend: 'over' },
  ])
}
