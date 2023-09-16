import fs from 'fs'
import asyncfs from 'fs/promises'
import path from 'path'
import jimp from 'jimp'
import Jimp from 'jimp'
import imageSize from 'image-size'
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
      await asyncfs.rm(imgPath)
      await asyncfs.rename(`${imgPath}.tmp`, imgPath)
    }),
  ).catch((err) => {
    throw err
  })
}

async function handleImageProcessing(
  imgPath: string,
  opts: PicommitConfig['imageProcessingOptions'],
) {
  const image = await jimp.read(imgPath)
  handleSize(image, opts, imgPath)
  handleShadow(image, opts)
  handleQuality(image, opts)
  image.writeAsync(`${imgPath}.tmp`)
}

function handleSize(
  image: Jimp,
  opts: PicommitConfig['imageProcessingOptions'],
  imgPath: string,
) {
  const dimensions = imageSize(imgPath)
  let width = opts.width ? Number(opts.width) : Jimp.AUTO
  let height = opts.height ? Number(opts.height) : Jimp.AUTO
  if (width === Jimp.AUTO && height === Jimp.AUTO) {
    width = dimensions.width
    height = dimensions.height
  }
  image.resize(width, height)
  return image
}

function handleShadow(
  image: Jimp,
  opts: PicommitConfig['imageProcessingOptions'],
) {
  if (!opts.shadow || !Object.keys(opts.shadow).length) return image

  const opacity = opts.shadow.opacity && Number(opts.shadow.opacity)
  const size = opts.shadow.size && Number(opts.shadow.size)
  const blur = opts.shadow.blur && Number(opts.shadow.blur)
  const x = opts.shadow.x && Number(opts.shadow.x)
  const y = opts.shadow.y && Number(opts.shadow.y)

  image.shadow({
    opacity,
    size,
    blur,
    x,
    y,
  })
  return image
}

function handleQuality(
  image: Jimp,
  opts: PicommitConfig['imageProcessingOptions'],
) {
  const quality = opts.quality ? 100 : Number(opts.quality)
  image.quality(quality)
  return image
}
