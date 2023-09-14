const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const DOCS_DIR = './docs'
const IMG_EXTENSIONS = ['.png', '.jpg', '.jpeg']

function getImagesFromDocs(dir) {
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

function processImages() {
  const images = getImagesFromDocs(DOCS_DIR)

  images.forEach((imgPath) => {
    sharp(imgPath)
      .resize(800)
      .jpeg({ quality: 80 })
      .toFile(imgPath, (err, info) => {
        if (err) {
          console.error(`Failed to process image: ${imgPath}`, err)
          process.exit(1)
        }
      })
  })
}

processImages()
