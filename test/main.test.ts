import { readPicommitConfig } from '../src/main'

describe('Parse Config file', () => {
  it('reads the picommit.json configuration', () => {
    const config = readPicommitConfig()
    expect(config.imageProcessingOptions?.width).toBe(800)
  })
})
