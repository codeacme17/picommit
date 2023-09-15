import fs from 'fs'
import path from 'path'
import { picommitInit } from '../src/main'

describe('picommitInit', () => {
  const HOOKS_DIR = path.join('.git', 'hooks')
  const PICOMMIT_FILE = '.picommit'

  beforeEach(() => {
    if (fs.existsSync(path.join(HOOKS_DIR, 'pre-commit'))) {
      fs.unlinkSync(path.join(HOOKS_DIR, 'pre-commit'))
    }
    if (fs.existsSync(PICOMMIT_FILE)) {
      fs.unlinkSync(PICOMMIT_FILE)
    }
  })

  it('should create the pre-commit hook', () => {
    picommitInit()
    expect(fs.existsSync(path.join(HOOKS_DIR, 'pre-commit'))).toBe(
      true
    )
  })

  it('should create the .picommit file', () => {
    picommitInit()
    expect(fs.existsSync(PICOMMIT_FILE)).toBe(true)
  })
})
