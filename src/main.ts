import fs from 'fs'
import asyncfs from 'fs/promises'
import path from 'path'
import jimp from 'jimp'

const IMG_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp']
const CONFIG_FILENAME = 'picommit.json'

interface PicommitConfig {
  docsDirectory?: string
  exclude?: string[]
  imageProcessingOptions?: {
    width?: number
    height?: number
    quality?: number
    shadow?: {
      opacity?: number
      size?: number
      blur?: number
      x?: number
      y?: number
    }
  }
}

const DEFAULT: PicommitConfig = {
  docsDirectory: './docs',
  exclude: [],
  imageProcessingOptions: {
    width: jimp.AUTO,
    height: jimp.AUTO,
    quality: 100,
    shadow: {
      opacity: 0,
      size: 0,
      blur: 0,
      x: 0,
      y: 0,
    },
  },
}

export function readPicommitConfig(): PicommitConfig {
  if (!fs.existsSync(CONFIG_FILENAME))
    fs.writeFileSync(CONFIG_FILENAME, JSON.stringify(DEFAULT))

  const rawData = JSON.parse(
    fs.readFileSync(CONFIG_FILENAME, 'utf-8')
  )

  return rawData
}

const config = readPicommitConfig()

export async function processImages(): Promise<void> {
  const images = getImagesFromDocs(
    config.docsDirectory || DEFAULT.docsDirectory
  )

  await Promise.all(
    images.map(async (imgPath) => {
      try {
        const image = await jimp.read(imgPath)
        const opts = config.imageProcessingOptions || {}
        await image
          .resize(
            Number(opts.width) || jimp.AUTO,
            Number(opts.height) || jimp.AUTO
          )
          .shadow({
            opacity: 0.8,
            size: 1.2,
            blur: 10,
            x: -75,
            y: -75,
          })
          .quality(opts.quality || 100)
          .writeAsync(`${imgPath}.tmp`)
      } catch (error) {
        console.error('Error:' + error)
        process.exit(1)
      }

      await asyncfs.rm(imgPath)
      await asyncfs.rename(`${imgPath}.tmp`, imgPath)
    })
  ).catch((error) => {
    console.error('Error:' + error)
    process.exit(1)
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
