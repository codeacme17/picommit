const sharp = require('sharp')
const {
  getImagesFromDocs,
  processImages,
} = require('../src/script/pre-commit')

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
    processImages('./test_docs')

    const imagePath = 'test_docs\\en-question-type-answer.png'
    const metadata = await sharp(imagePath).metadata()

    expect(metadata.width).toBe(800)
  })
})
