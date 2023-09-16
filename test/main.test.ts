import { readPicommitConfig } from '../src/main'

describe('Parse Config file', () => {
  it('reads the picommit.json configuration', async () => {
    const config = await readPicommitConfig()
    expect(config.exclude).toStrictEqual([])
  })
})
