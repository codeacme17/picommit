import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const DOCS_DIR = './docs'
const IMG_EXTENSIONS = ['.png', '.jpg', '.jpeg']

export function processImages(docsDir = DOCS_DIR) {
  const images = getImagesFromDocs(docsDir)

  images.forEach((imgPath) => {
    sharp(imgPath)
      .resize(800)
      .png({ quality: 80 })
      .toFile(`${imgPath}.tmp`, (err) => {
        if (err) {
          console.error(`Failed to process image: ${imgPath}`, err)
          process.exit(1)
        } else {
          fs.rmSync(imgPath)
          fs.renameSync(`${imgPath}.tmp`, imgPath)
        }
      })
  })
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
