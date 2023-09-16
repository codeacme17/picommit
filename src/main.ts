import fs from 'fs'
import asyncfs from 'fs/promises'
import path from 'path'

const CONFIG_FILENAME = '.picommit.json'
const TEMPLATE_FILENAME = 'template.json'
const TEMPLATE_PATH = path.resolve(__dirname, TEMPLATE_FILENAME)
export interface PicommitConfig {
  docsDirectory?: string
  exclude?: string[]
  imageProcessingOptions?: {
    width?: number | 'auto'
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

export async function readPicommitConfig(): Promise<PicommitConfig> {
  if (!fs.existsSync(CONFIG_FILENAME))
    await asyncfs.copyFile(TEMPLATE_PATH, CONFIG_FILENAME)

  const rawData = JSON.parse(fs.readFileSync(CONFIG_FILENAME, 'utf-8'))
  return rawData
}

export function readDefaultConfig(): PicommitConfig {
  const rawData = JSON.parse(fs.readFileSync(TEMPLATE_PATH, 'utf-8'))
  return rawData
}
