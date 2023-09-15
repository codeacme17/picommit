import sharp from 'sharp'
import { readPicommitConfig } from '../src/main'
import {
  getImagesFromDocs,
  processImages,
} from '../src/process-images'

describe('Process Images functions', () => {
  it('process imaged', async () => {
    const config = readPicommitConfig()
    await processImages(config)
    const imagePath = 'test_docs\\test.png'
    const metadata = await sharp(imagePath).metadata()
    expect(metadata.width).toBe(800)
  })

  it('gets images from a given directory', async () => {
    const config = readPicommitConfig()
    const images = getImagesFromDocs('./test_docs', config)
    expect(images).toEqual(
      expect.arrayContaining(['test_docs\\test.png'])
    )
  })
})
