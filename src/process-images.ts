import fs from 'fs'
import asyncfs from 'fs/promises'
import path from 'path'
import jimp from 'jimp'
import type Jimp from 'jimp'
import { DEFAULT, type PicommitConfig } from './main'

const IMG_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp']

export function getImagesFromDocs(
  dir: string,
  { exclude = [] }: PicommitConfig
): string[] {
  let results: string[] = []
  const files = fs.readdirSync(dir)

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
      const image = await jimp.read(imgPath)
      handleImageProcessing(image, imageProcessingOptions).writeAsync(
        `${imgPath}.tmp`
      )
      await asyncfs.rm(imgPath)
      await asyncfs.rename(`${imgPath}.tmp`, imgPath)
    })
  ).catch((err) => {
    throw err
  })
}

function handleImageProcessing(
  image: Jimp,
  opts: PicommitConfig['imageProcessingOptions']
) {
  handleSize(image, opts)
  handleShadow(image, opts)
  handleQuality(image, opts)
  return image
}

function handleSize(
  image: Jimp,
  opts: PicommitConfig['imageProcessingOptions']
) {
  const { width, height } = opts
  image.resize(Number(width), Number(height))
  return image
}

function handleShadow(
  image: Jimp,
  opts: PicommitConfig['imageProcessingOptions']
) {
  image.shadow(
    opts.shadow && {
      opacity: opts.shadow.opacity && Number(opts.shadow.opacity),
      size: opts.shadow.size && Number(opts.shadow.size),
      blur: opts.shadow.blur && Number(opts.shadow.blur),
      x: opts.shadow.x && Number(opts.shadow.x),
      y: opts.shadow.y && Number(opts.shadow.y),
    }
  )
  return image
}

function handleQuality(
  image: Jimp,
  opts: PicommitConfig['imageProcessingOptions']
) {
  image.quality(opts.quality && Number(opts.quality))
  return image
}
