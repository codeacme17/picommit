import path from 'path'
import imageSize from 'image-size'
import { readPicommitConfig } from '../src/main'
import { getImagesFromDocs, processImages } from '../src/process-images'

describe('Process Images functions', () => {
  it(
    'process imaged',
    async () => {
      const config = await readPicommitConfig()
      await processImages(config)

      const imagePath = path.resolve(__dirname, '../test_docs/test.jpg')
      const dimensions = imageSize(imagePath)

      expect(dimensions.width).toBe(800)
    },
    10 * 1000,
  )

  it('gets images from a given directory', async () => {
    const config = await readPicommitConfig()
    const images = getImagesFromDocs('./test_docs', config)
    expect(images).toEqual(['test_docs/test.JPG'])
  })
})
