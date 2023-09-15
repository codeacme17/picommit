const sharp = require('sharp')
const fs = require('fs')
const {
  getImagesFromDocs,
  processImages,
  readPicommitConfig,
} = require('../src/main')
const jimp = require('jimp')

describe('Parse Config file', () => {
  it('reads the picommit.json configuration', () => {
    const config = readPicommitConfig()
    expect(config.docsDirectory).toBe('./test-docs')
  })
})

describe('Image Processor', () => {
  test('should return correct image paths from docs', () => {
    const images = getImagesFromDocs('./test_docs')

    expect(images).toEqual(
      expect.arrayContaining([
        'test_docs\\en-question-type-answer.png',
      ])
    )
  })

  test('should process images correctly', async () => {
    await processImages('./test_docs')

    const imagePath = 'test_docs\\en-question-type-answer.png'
    const metadata = await sharp(imagePath).metadata()
    expect(metadata.width).toBe(800)
  })
})
