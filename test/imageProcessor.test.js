// imageProcessor.test.js

const fs = require('fs')
const sharp = require('sharp')
const {
  getImagesFromDocs,
  processImages,
} = require('./imageProcessor')

describe('Image Processor', () => {
  beforeAll(() => {
    // Setup: Create dummy image files in DOCS_DIR for testing
  })

  afterAll(() => {
    // Cleanup: Delete the dummy image files or restore them
  })

  test('should return correct image paths from docs', () => {
    const images = getImagesFromDocs('./test_docs')
    expect(images).toEqual(
      expect.arrayContaining([
        './test_docs/test_image.jpg',
        // ... other expected paths
      ])
    )
  })

  test('should process images correctly', async () => {
    processImages()

    const imagePath = './test_docs/test_image.jpg'
    const metadata = await sharp(imagePath).metadata()

    expect(metadata.width).toBe(800)
    // Add other assertions related to image processing
  })
})
