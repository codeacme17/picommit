import fs from 'fs'

const CONFIG_FILENAME = 'picommit.json'

export interface PicommitConfig {
  docsDirectory?: string
  exclude?: string[]
  imageProcessingOptions?: {
    width?: number
    height?: number
    quality?: number
    shadow?: {
      opacity?: number
      size?: number
      blur?: number
      x?: number
      y?: number
    }
  }
}

export const DEFAULT: PicommitConfig = {
  docsDirectory: './docs',
  exclude: [],
  imageProcessingOptions: {},
}

export function readPicommitConfig(): PicommitConfig {
  if (!fs.existsSync(CONFIG_FILENAME))
    fs.writeFileSync(CONFIG_FILENAME, JSON.stringify(DEFAULT))

  const rawData = JSON.parse(
    fs.readFileSync(CONFIG_FILENAME, 'utf-8')
  )

  return rawData
}
