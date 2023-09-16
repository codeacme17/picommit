import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { DEFAULT, type PicommitConfig } from './main'

const IMG_EXTENSIONS = ['.png', '.jpg', '.jpeg']

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
      await fs.promises.rm(imgPath)
      await fs.promises.rename(`${imgPath}.tmp`, imgPath)
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
  image = handleSize(image, opts)
  // Note: sharp doesn't support shadows out of the box. You might need to implement this manually or with another library.
  // image = handleShadow(image, opts)
  image = handleQuality(image, opts)
  await image.toFile(`${imgPath}.tmp`)
}

function handleSize(
  image: sharp.Sharp,
  opts: PicommitConfig['imageProcessingOptions'],
): sharp.Sharp {
  const { width, height } = opts
  return image.resize(width, height)
}

function handleQuality(
  image: sharp.Sharp,
  opts: PicommitConfig['imageProcessingOptions'],
): sharp.Sharp {
  const quality = opts.quality || 100
  return image.jpeg({ quality })
}

// Note: handleShadow function is commented out since sharp doesn't provide direct shadow implementation.
