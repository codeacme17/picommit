import fs from 'fs'
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
      const image = await jimp.read(imgPath)
      await image.resize(800, jimp.AUTO).writeAsync(`${imgPath}.tmp`)
      fs.rmSync(imgPath)
      fs.renameSync(`${imgPath}.tmp`, imgPath)
    })
  )
}

export function getImagesFromDocs(dir: string) {
  let results = []

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
