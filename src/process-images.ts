import fs from 'fs'
import asyncfs from 'fs/promises'
import path from 'path'
import jimp from 'jimp'
import { DEFAULT, type PicommitConfig } from './main'

const IMG_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp']

let config: PicommitConfig

export async function processImages(
  config: PicommitConfig
): Promise<void> {
  config = config

  const images = getImagesFromDocs(
    config.docsDirectory || DEFAULT.docsDirectory
  )

  await Promise.all(
    images.map(async (imgPath) => {
      try {
        const image = await jimp.read(imgPath)
        const opts =
          config.imageProcessingOptions ||
          DEFAULT.imageProcessingOptions
        await image
          .resize(
            opts.width && Number(opts.width),
            opts.height && Number(opts.height)
          )
          .shadow({
            opacity:
              opts.shadow.opacity && Number(opts.shadow.opacity),
            size: opts.shadow.size && Number(opts.shadow.size),
            blur: opts.shadow.blur && Number(opts.shadow.blur),
            x: opts.shadow.x && Number(opts.shadow.x),
            y: opts.shadow.y && Number(opts.shadow.y),
          })
          .quality(opts.quality || 100)
          .writeAsync(`${imgPath}.tmp`)
      } catch (error) {
        throw Error(error)
      }

      await asyncfs.rm(imgPath)
      await asyncfs.rename(`${imgPath}.tmp`, imgPath)
    })
  ).catch((error) => {
    throw Error(error)
  })
}

export function getImagesFromDocs(dir: string): string[] {
  let results: string[] = []

  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      results = results.concat(getImagesFromDocs(fullPath))
    } else if (
      IMG_EXTENSIONS.includes(path.extname(file).toLowerCase()) &&
      !config.exclude.includes(fullPath)
    ) {
      results.push(fullPath)
    }
  }

  return results
}
