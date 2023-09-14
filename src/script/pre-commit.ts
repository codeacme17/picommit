import fs from 'fs'
import asyncfs from 'fs/promises'
import path from 'path'
import jimp from 'jimp'

const DOCS_DIR = './docs'
const IMG_EXTENSIONS = ['.png', '.jpg', '.jpeg']

export async function processImages(
  docsDir: string = DOCS_DIR
): Promise<void> {
  const images = getImagesFromDocs(docsDir)

  await Promise.all(
    images.map(async (imgPath) => {
      try {
        const image = await jimp.read(imgPath)
        await image
          .resize(800, jimp.AUTO)
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
      IMG_EXTENSIONS.includes(path.extname(file).toLowerCase())
    ) {
      results.push(fullPath)
    }
  }

  return results
}
