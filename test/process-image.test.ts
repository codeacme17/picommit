// import path from 'path'
// import sharp from 'sharp'
import { readPicommitConfig } from '../src/main'
import { processImages } from '../src/process-images'

describe('Process Images functions', () => {
  it('process imaged', async () => {
    const config = await readPicommitConfig()
    await processImages(config)

    // const imagePath = path.resolve(__dirname, '../test_docs/test.png')
    // const metadata = await sharp(imagePath).metadata()

    // expect(metadata.width).toBe(config.imageProcessingOptions?.width)
  })

  // it('gets images from a given directory', async () => {
  //   const config = await readPicommitConfig()
  //   const images = getImagesFromDocs('./test_docs', config)

  //   expect(images).toEqual(['test_docs/test.png'])
  // })
})
