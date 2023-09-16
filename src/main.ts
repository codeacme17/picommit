import fs from 'fs'
import asyncfs from 'fs/promises'
import path from 'path'
import stripJsonComments from 'strip-json-comments'

const CONFIG_FILENAME = '.picommit.json'
const TEMPLATE_FILENAME = 'template.json'
const TEMPLATE_PATH = path.resolve(__dirname, TEMPLATE_FILENAME)

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

export async function readPicommitConfig(): Promise<PicommitConfig> {
  if (!fs.existsSync(CONFIG_FILENAME))
    await asyncfs.copyFile(TEMPLATE_PATH, CONFIG_FILENAME)
  return parseJSONFile(CONFIG_FILENAME)
}

export function readDefaultConfig(): PicommitConfig {
  return parseJSONFile(TEMPLATE_PATH)
}

function parseJSONFile(filePath: string) {
  const rowJSON = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(stripJsonComments(rowJSON))
  return data
}
